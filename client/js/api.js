const LOGIN_PAGE = window.location.pathname.includes('/pages/') ? './login.html' : './pages/login.html';

function normalizeApiBase(base) {
  return String(base || '').trim().replace(/\/+$/, '');
}

function isLocalHostname(hostname) {
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

function buildApiBaseCandidates() {
  const candidates = [];
  const customBase = window.__STUDYPLAN_API_BASE__;
  const { protocol, origin, hostname } = window.location;

  if (customBase) {
    candidates.push(normalizeApiBase(customBase));
  }

  if (protocol !== 'file:' && isLocalHostname(hostname)) {
    candidates.push(`${protocol}//${hostname}:5174/api`);
    candidates.push(`${origin}/api`);
  } else if (protocol !== 'file:') {
    candidates.push(`${origin}/api`);
  }

  candidates.push('http://localhost:5174/api');
  candidates.push('http://127.0.0.1:5174/api');

  return [...new Set(candidates.filter(Boolean).map(normalizeApiBase))];
}

class ApiClient {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.apiBases = buildApiBaseCandidates();
    this.apiBase = this.apiBases[0];
  }

  getHeaders(extraHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      ...extraHeaders,
    };
  }

  getCandidateBases() {
    return [this.apiBase, ...this.apiBases.filter((base) => base !== this.apiBase)];
  }

  shouldTryNextBase(response, contentType, payload) {
    if (!contentType.includes('application/json')) {
      return true;
    }

    if (response.status === 404 && payload?.message === 'Route not found') {
      return true;
    }

    return false;
  }

  async parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return {
        contentType,
        payload: text ? { message: text } : null,
      };
    }

    try {
      return {
        contentType,
        payload: await response.json(),
      };
    } catch (error) {
      return {
        contentType,
        payload: null,
      };
    }
  }

  async request(endpoint, options = {}) {
    const candidates = this.getCandidateBases();
    let lastError = null;

    for (let index = 0; index < candidates.length; index += 1) {
      const base = candidates[index];
      let response;

      try {
        response = await fetch(`${base}${endpoint}`, {
          ...options,
          headers: this.getHeaders(options.headers || {}),
        });
      } catch (error) {
        lastError = error;
        continue;
      }

      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken(base);
        if (refreshed) {
          this.apiBase = base;
          return this.request(endpoint, options);
        }
        throw new Error('Session expired. Please log in again.');
      }

      if (response.status === 204) {
        this.apiBase = base;
        return null;
      }

      const { contentType, payload } = await this.parseResponse(response);
      const message = payload?.message || 'API request failed';

      if (response.ok) {
        this.apiBase = base;
        return payload?.data ?? payload;
      }

      if (index < candidates.length - 1 && this.shouldTryNextBase(response, contentType, payload)) {
        lastError = new Error(message);
        continue;
      }

      throw new Error(message);
    }

    throw new Error(lastError?.message || 'Unable to connect to the StudyPlan Hub server.');
  }

  async refreshAccessToken(preferredBase = this.apiBase) {
    const candidates = [preferredBase, ...this.apiBases.filter((base) => base !== preferredBase)];

    for (const base of candidates) {
      try {
        const response = await fetch(`${base}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: this.refreshToken,
          }),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        this.accessToken = data.data.accessToken;
        this.refreshToken = data.data.refreshToken;
        this.apiBase = base;

        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        return true;
      } catch (error) {
        continue;
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken = null;
    this.refreshToken = null;
    window.location.href = LOGIN_PAGE;
    return false;
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return data;
  }

  async logout() {
    if (this.refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({
            refreshToken: this.refreshToken,
          }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken = null;
    this.refreshToken = null;
  }

  async getUserProfile() {
    return this.request('/users/me', {
      method: 'GET',
    });
  }

  async getPlans(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('subject', filters.category);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    return this.request(`/plans?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getPopularPlans() {
    return this.request('/plans/popular', {
      method: 'GET',
    });
  }

  async getPlanById(planId) {
    return this.request(`/plans/${planId}`, {
      method: 'GET',
    });
  }

  async createPlan(planData) {
    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePlan(planId, planData) {
    return this.request(`/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deletePlan(planId) {
    return this.request(`/plans/${planId}`, {
      method: 'DELETE',
    });
  }

  async followPlan(planId) {
    return this.request(`/follow/${planId}`, {
      method: 'POST',
    });
  }

  async unfollowPlan(planId) {
    return this.request(`/follow/${planId}`, {
      method: 'DELETE',
    });
  }

  async getPlanProgress(planId) {
    return this.request(`/progress/${planId}`, {
      method: 'GET',
    });
  }

  async updateProgress(planId, completedTaskIds) {
    return this.request(`/progress/${planId}`, {
      method: 'POST',
      body: JSON.stringify({ completedTaskIds }),
    });
  }

  async ratePlan(planId, rating) {
    return this.request(`/rating/${planId}`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }
}

const api = new ApiClient();
