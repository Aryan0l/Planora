const activeScreen = document.body.dataset.page || '';

function pathToPage(pageName) {
  return activeScreen === 'home' ? `./pages/${pageName}` : `./${pageName}`;
}

function pathToHome() {
  return activeScreen === 'home' ? './index.html' : '../index.html';
}

function showMessage(message, type = 'info') {
  const messageEl = document.querySelector('.message');
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.className = `message show ${type}`;

  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 4000);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[char];
  });
}

function formatDateTime(dateString, options = {}) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

function formatRatingValue(value) {
  return Number(value || 0).toFixed(1);
}

function renderStars(rating = 0) {
  const full = Math.round(Number(rating) || 0);
  let stars = '';

  for (let i = 1; i <= 5; i += 1) {
    stars += i <= full
      ? '<span class="star filled">&#9733;</span>'
      : '<span class="star">&#9734;</span>';
  }

  return stars;
}

function isAuthenticated() {
  return Boolean(localStorage.getItem('accessToken'));
}

function getPlanSubject(plan) {
  return plan.subject || plan.category || 'Other';
}

function getPlanDuration(plan) {
  return Number(plan.durationDays ?? plan.duration_days ?? 0);
}

function getPlanFollowerCount(plan) {
  return Number(plan.followerCount ?? plan.follower_count ?? 0);
}

function getPlanRating(plan) {
  return Number(plan.averageRating ?? plan.average_rating ?? 0);
}

function updateNavigation() {
  const guestNav = document.getElementById('guestNav');
  const memberNav = document.getElementById('memberNav');
  const signoutBtn = document.getElementById('signoutBtn');

  if (isAuthenticated()) {
    if (guestNav) guestNav.style.display = 'none';
    if (memberNav) memberNav.style.display = 'flex';

    if (signoutBtn) {
      signoutBtn.onclick = async () => {
        await studyPlanGateway.logout();
        window.location.href = pathToHome();
      };
    }
  } else {
    if (guestNav) guestNav.style.display = 'flex';
    if (memberNav) memberNav.style.display = 'none';
  }
}

function openSignin() {
  window.location.href = pathToPage('signin.html');
}

function openWorkspace() {
  window.location.href = pathToPage('workspace.html');
}

function openPlanner() {
  window.location.href = pathToPage('planner.html');
}

function goHome() {
  window.location.href = pathToHome();
}

function openPlanView(id) {
  window.location.href = `${pathToPage('plan-view.html')}?id=${id}`;
}

function renderEmptyState(title, description, linkHref, linkLabel) {
  const link = linkHref && linkLabel
    ? `<p><a href="${linkHref}">${escapeHtml(linkLabel)}</a></p>`
    : '';

  return `
    <div class="empty-state">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      ${link}
    </div>
  `;
}

function renderLoadingCards(count = 3) {
  return Array.from({ length: count }, () => `
    <div class="study-card">
      <div class="study-card-header">
        <div class="skeleton" style="height:1.75rem; width:8rem;"></div>
        <div class="skeleton" style="height:1rem; width:4rem;"></div>
      </div>
      <div class="study-card-body">
        <div class="skeleton" style="height:1.5rem; width:70%;"></div>
        <div class="skeleton" style="height:4rem; width:100%;"></div>
        <div class="skeleton" style="height:5rem; width:100%;"></div>
      </div>
    </div>
  `).join('');
}

function createPlanCard(plan) {
  const title = escapeHtml(plan.title);
  const description = escapeHtml(plan.description);
  const subject = escapeHtml(getPlanSubject(plan));
  const duration = getPlanDuration(plan);
  const followers = getPlanFollowerCount(plan);
  const rating = getPlanRating(plan);
  const taskCount = Array.isArray(plan.tasks) ? plan.tasks.length : 0;

  return `
    <article class="study-card">
      <div class="study-card-header">
        <span class="study-card-subject">${subject}</span>
        <span class="study-card-score">${formatRatingValue(rating)} / 5</span>
      </div>

      <div class="study-card-body">
        <div>
          <h3 class="study-card-title">${title}</h3>
          <p class="study-description">${description}</p>
        </div>

        <div class="study-meta-row">
          <span class="meta-pill">${duration} day${duration === 1 ? '' : 's'}</span>
          <span class="meta-pill">${followers} follower${followers === 1 ? '' : 's'}</span>
        </div>

        <div class="plan-stats">
          <div class="stat">
            <span class="stat-value">${duration}</span>
            <span class="stat-label">Days</span>
          </div>
          <div class="stat">
            <span class="stat-value">${followers}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="stat">
            <span class="stat-value">${taskCount || '--'}</span>
            <span class="stat-label">Tasks</span>
          </div>
        </div>

        <div class="rating-display">
          <span>${renderStars(rating)}</span>
          <span>${formatRatingValue(rating)}</span>
        </div>

        <div class="study-actions">
          <button type="button" class="btn btn-primary" onclick="openPlanView(${plan.id})">View Plan</button>
          <button type="button" class="btn btn-secondary" onclick="followPlan(${plan.id})">Follow</button>
        </div>
      </div>
    </article>
  `;
}

function createDashboardPlanCard(plan, isOwner) {
  const title = escapeHtml(plan.title);
  const description = escapeHtml(plan.description || 'A community study plan ready to revisit.');
  const subject = escapeHtml(getPlanSubject(plan));
  const duration = getPlanDuration(plan);
  const followers = getPlanFollowerCount(plan);
  const rating = getPlanRating(plan);

  return `
    <article class="study-card studio-study-card">
      <div class="study-card-header">
        <span class="study-card-subject">${subject}</span>
        <span class="study-card-score">${formatRatingValue(rating)} / 5</span>
      </div>

      <div class="study-card-body">
        <div onclick="openPlanView(${plan.id})">
          <h3 class="study-card-title">${title}</h3>
          <p class="study-description">${description}</p>
        </div>

        <div class="study-meta-row">
          <span class="meta-pill">${duration} day${duration === 1 ? '' : 's'}</span>
          <span class="meta-pill">${followers} follower${followers === 1 ? '' : 's'}</span>
        </div>

        <div class="rating-display">
          <span>${renderStars(rating)}</span>
          <span>${formatRatingValue(rating)}</span>
        </div>

        <div class="study-actions">
          <button type="button" class="btn btn-primary" onclick="openPlanView(${plan.id})">View</button>
          ${isOwner
            ? `<button type="button" class="btn btn-danger" onclick="deletePlanFromDashboard(${plan.id})">Delete</button>`
            : `<button type="button" class="btn btn-secondary" onclick="unfollowFromDashboard(${plan.id})">Unfollow</button>`}
        </div>
      </div>
    </article>
  `;
}

function updateHomeMetrics(plans) {
  const metricsEl = document.getElementById('libraryMetrics');
  const heroPlanCount = document.getElementById('heroPlanCount');

  if (heroPlanCount) {
    heroPlanCount.textContent = `${plans.length} Plan${plans.length === 1 ? '' : 's'} Ready`;
  }

  if (!metricsEl) return;

  const ratings = plans.map((plan) => getPlanRating(plan)).filter((rating) => rating > 0);
  const averageRating = ratings.length
    ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
    : '0.0';
  const subjects = new Set(plans.map((plan) => getPlanSubject(plan))).size;

  metricsEl.innerHTML = `
    <div class="overview-card">
      <span class="overview-value">${plans.length}</span>
      <span class="overview-label">Plans available</span>
    </div>
    <div class="overview-card">
      <span class="overview-value">${averageRating}</span>
      <span class="overview-label">Average rating</span>
    </div>
    <div class="overview-card">
      <span class="overview-value">${subjects}</span>
      <span class="overview-label">Subjects covered</span>
    </div>
  `;
}

async function loadHomePlans() {
  const studyGrid = document.getElementById('studyGrid');
  if (!studyGrid) return;

  const librarySearchInput = document.getElementById('librarySearchInput');
  const subjectFilter = document.getElementById('subjectFilter');
  const signalSort = document.getElementById('signalSort');

  studyGrid.innerHTML = renderLoadingCards(6);

  try {
    const plans = await studyPlanGateway.getPlans({
      search: librarySearchInput ? librarySearchInput.value.trim() : '',
      category: subjectFilter ? subjectFilter.value : '',
      sortBy: signalSort ? signalSort.value : '',
    });

    updateHomeMetrics(plans);

    if (!plans.length) {
      studyGrid.innerHTML = renderEmptyState(
        'No plans found',
        'Try widening the filters or searching with a different keyword.',
      );
      return;
    }

    studyGrid.innerHTML = plans.map((plan) => createPlanCard(plan)).join('');
  } catch (error) {
    const description = /connect|fetch failed|failed to fetch/i.test(String(error.message))
      ? 'The app could not reach the backend right now. Start the server and try again.'
      : 'The plan library could not be loaded right now. Try again in a moment.';

    studyGrid.innerHTML = renderEmptyState(
      'Unable to load plans',
      description,
    );

    showMessage(error.message || 'Unable to load plans right now.', 'error');
  }
}

function setupHomePage() {
  const librarySearchBtn = document.getElementById('librarySearchBtn');
  const librarySearchInput = document.getElementById('librarySearchInput');
  const subjectFilter = document.getElementById('subjectFilter');
  const signalSort = document.getElementById('signalSort');

  librarySearchBtn?.addEventListener('click', loadHomePlans);
  subjectFilter?.addEventListener('change', loadHomePlans);
  signalSort?.addEventListener('change', loadHomePlans);

  librarySearchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      loadHomePlans();
    }
  });

  loadHomePlans();
}

async function followPlan(id) {
  if (!isAuthenticated()) {
    openSignin();
    return;
  }

  try {
    await studyPlanGateway.followPlan(id);
    showMessage('Plan followed successfully.', 'success');
  } catch (error) {
    showMessage(error.message || 'Unable to follow this plan right now.', 'error');
  }
}

function bindSigninForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      await studyPlanGateway.login(formData.get('email'), formData.get('password'));
      showMessage('Login successful. Redirecting to your dashboard.', 'success');

      setTimeout(() => {
        openWorkspace();
      }, 800);
    } catch (error) {
      showMessage(error.message || 'Login failed.', 'error');
    }
  });
}

function bindJoinForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      return;
    }

    try {
      await studyPlanGateway.register(formData.get('name'), formData.get('email'), password);
      showMessage('Account created. Redirecting you to login.', 'success');

      setTimeout(() => {
        window.location.href = pathToPage('signin.html');
      }, 1000);
    } catch (error) {
      showMessage(error.message || 'Registration failed.', 'error');
    }
  });
}

function updateDashboardMetrics(profile) {
  const metricsEl = document.getElementById('studioMetrics');
  if (!metricsEl) return;

  const createdCount = (profile.ownedPlans || []).length;
  const followedCount = (profile.savedPlans || []).length;
  const joinedDate = formatDateTime(profile.createdAt, {
    month: 'short',
    year: 'numeric',
  });

  metricsEl.innerHTML = `
    <div class="overview-card">
      <span class="overview-value">${createdCount}</span>
      <span class="overview-label">Plans created</span>
    </div>
    <div class="overview-card">
      <span class="overview-value">${followedCount}</span>
      <span class="overview-label">Plans followed</span>
    </div>
    <div class="overview-card">
      <span class="overview-value">${escapeHtml(joinedDate)}</span>
      <span class="overview-label">Member since</span>
    </div>
  `;
}

async function hydrateWorkspace() {
  if (!isAuthenticated()) {
    openSignin();
    return;
  }

  try {
    const profile = await studyPlanGateway.getUserProfile();
    const joinedDate = formatDateTime(profile.createdAt);
    const createdCount = (profile.ownedPlans || []).length;
    const followedCount = (profile.savedPlans || []).length;
    updateDashboardMetrics(profile);

    const learnerInfo = document.getElementById('learnerInfo');
    if (learnerInfo) {
      learnerInfo.innerHTML = `
        <div class="learner-panel">
          <div class="learner-summary">
            <div class="learner-identity">
              <p class="learner-name">${escapeHtml(profile.name)}</p>
              <p class="learner-email">${escapeHtml(profile.email)}</p>
            </div>
            <div class="learner-stats">
              <div class="learner-row">
                <span class="learner-row-label">Created</span>
                <span class="learner-row-value">${createdCount}</span>
              </div>
              <div class="learner-row">
                <span class="learner-row-label">Following</span>
                <span class="learner-row-value">${followedCount}</span>
              </div>
            </div>
          </div>

          <div class="learner-info">
            <div class="learner-row">
              <span class="learner-row-label">Name</span>
              <span class="learner-row-value">${escapeHtml(profile.name)}</span>
            </div>
            <div class="learner-row">
              <span class="learner-row-label">Email</span>
              <span class="learner-row-value">${escapeHtml(profile.email)}</span>
            </div>
            <div class="learner-row">
              <span class="learner-row-label">Member Since</span>
              <span class="learner-row-value">${escapeHtml(joinedDate)}</span>
            </div>
            <div class="learner-row">
              <span class="learner-row-label">Plans Created</span>
              <span class="learner-row-value">${createdCount}</span>
            </div>
            <div class="learner-row">
              <span class="learner-row-label">Plans Followed</span>
              <span class="learner-row-value">${followedCount}</span>
            </div>
          </div>
        </div>
      `;
    }

    const ownedPlans = document.getElementById('ownedPlans');
    if (ownedPlans) {
      const created = profile.ownedPlans || [];
      ownedPlans.innerHTML = created.length
        ? created.map((plan) => createDashboardPlanCard(plan, true)).join('')
        : renderEmptyState(
            'No plans created yet',
            'Your published plans will show up here as soon as you share one.',
            './planner.html',
            'Create your first plan',
          );
    }

    const savedPlans = document.getElementById('savedPlans');
    if (savedPlans) {
      const followed = profile.savedPlans || [];
      savedPlans.innerHTML = followed.length
        ? followed.map((plan) => createDashboardPlanCard(plan, false)).join('')
        : renderEmptyState(
            'Not following any plans yet',
            'Browse the community library and follow a few strong starting points.',
            '../index.html',
            'Explore plans',
          );
    }
  } catch (error) {
    showMessage(error.message || 'Unable to load your dashboard.', 'error');
  }
}

async function deletePlanFromDashboard(planId) {
  if (!confirm('Delete this study plan?')) return;

  try {
    await studyPlanGateway.deletePlan(planId);
    showMessage('Plan deleted.', 'success');
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    showMessage(error.message || 'Failed to delete this plan.', 'error');
  }
}

async function unfollowFromDashboard(planId) {
  try {
    await studyPlanGateway.unfollowPlan(planId);
    showMessage('Plan removed from your followed list.', 'success');
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    showMessage(error.message || 'Failed to unfollow this plan.', 'error');
  }
}

function createTaskBuilderRow(task = {}) {
  const taskStack = document.getElementById('taskStack');
  if (!taskStack) return;

  const row = document.createElement('div');
  row.className = 'task-composer-card';
  row.innerHTML = `
    <div class="task-composer-head">
      <span class="task-composer-day">Day <span class="task-composer-day-value">1</span></span>
      <button type="button" class="btn btn-secondary task-delete-btn">Remove</button>
    </div>

    <div class="task-composer-fields">
      <div class="form-row">
        <div class="form-group">
          <label class="task-composer-label">Day Number</label>
          <input type="number" name="taskDay" min="1" value="${escapeHtml(task.day || '')}" required />
        </div>
        <div class="form-group">
          <label class="task-composer-label">Task Title</label>
          <input type="text" name="taskTitle" value="${escapeHtml(task.title || '')}" placeholder="Example: Review closures and scope" required />
        </div>
      </div>

      <div class="form-group">
        <label class="task-composer-label">Task Description</label>
        <textarea name="taskDescription" rows="3" placeholder="Describe what should get done on this day." required>${escapeHtml(task.description || '')}</textarea>
      </div>
    </div>
  `;

  const dayInput = row.querySelector('[name="taskDay"]');
  const dayValue = row.querySelector('.task-composer-day-value');
  const removeButton = row.querySelector('.task-delete-btn');

  dayInput?.addEventListener('input', () => {
    dayValue.textContent = dayInput.value || '1';
  });

  removeButton?.addEventListener('click', () => {
    row.remove();
    syncTaskBuilderRows();
  });

  taskStack.appendChild(row);
  syncTaskBuilderRows();
}

function syncTaskBuilderRows() {
  const rows = Array.from(document.querySelectorAll('.task-composer-card'));

  rows.forEach((row, index) => {
    const dayInput = row.querySelector('[name="taskDay"]');
    const dayValue = row.querySelector('.task-composer-day-value');
    const removeButton = row.querySelector('.task-delete-btn');

    if (dayInput && !dayInput.value) {
      dayInput.value = String(index + 1);
    }

    if (dayValue) {
      dayValue.textContent = dayInput ? dayInput.value || String(index + 1) : String(index + 1);
    }

    if (removeButton) {
      removeButton.style.visibility = rows.length === 1 ? 'hidden' : 'visible';
    }
  });
}

function collectTaskBuilderRows() {
  return Array.from(document.querySelectorAll('.task-composer-card')).map((row) => ({
    day: Number(row.querySelector('[name="taskDay"]').value),
    title: row.querySelector('[name="taskTitle"]').value.trim(),
    description: row.querySelector('[name="taskDescription"]').value.trim(),
  })).filter((task) => task.day && task.title && task.description);
}

function bindPlannerForm() {
  const form = document.getElementById('composerForm');
  const appendTaskBtn = document.getElementById('appendTaskBtn');
  if (!form) return;

  if (!isAuthenticated()) {
    openSignin();
    return;
  }

  createTaskBuilderRow({ day: 1 });

  appendTaskBtn?.addEventListener('click', () => {
    createTaskBuilderRow({ day: document.querySelectorAll('.task-composer-card').length + 1 });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const tasks = collectTaskBuilderRows();

    if (!tasks.length) {
      showMessage('Add at least one complete task before saving the plan.', 'error');
      return;
    }

    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      subject: formData.get('category'),
      durationDays: Number(formData.get('durationDays')),
      tasks,
    };

    try {
      const result = await studyPlanGateway.createPlan(payload);
      showMessage('Plan created successfully.', 'success');

      setTimeout(() => {
        openPlanView(result.id);
      }, 800);
    } catch (error) {
      showMessage(error.message || 'Failed to create this plan.', 'error');
    }
  });
}

let selectedRating = 0;

async function hydratePlanView() {
  const container = document.getElementById('studyDetail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const planId = params.get('id');

  if (!planId) {
    container.innerHTML = renderEmptyState(
      'Plan not found',
      'The page could not find a valid plan id to load.',
      pathToHome(),
      'Back to home',
    );
    return;
  }

  container.innerHTML = `
    <div class="skeleton-header">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    </div>
    <div class="skeleton skeleton-block"></div>
    <div class="skeleton skeleton-block"></div>
  `;

  try {
    let completedTaskIds = [];
    let isFollowing = false;
    let plan;

    if (isAuthenticated()) {
      const [planResult, progressResult, profileResult] = await Promise.allSettled([
        studyPlanGateway.getPlanById(planId),
        studyPlanGateway.getPlanProgress(planId),
        studyPlanGateway.getUserProfile(),
      ]);

      if (planResult.status === 'rejected') {
        throw planResult.reason;
      }

      plan = planResult.value;

      if (progressResult.status === 'fulfilled') {
        completedTaskIds = progressResult.value.completedTaskIds || [];
      }

      if (profileResult.status === 'fulfilled') {
        const followed = profileResult.value.savedPlans || [];
        isFollowing = followed.some((followedPlan) => followedPlan.id === plan.id);
      }
    } else {
      plan = await studyPlanGateway.getPlanById(planId);
    }

    const title = escapeHtml(plan.title);
    const description = escapeHtml(plan.description);
    const subject = escapeHtml(getPlanSubject(plan));
    const duration = getPlanDuration(plan);
    const followers = getPlanFollowerCount(plan);
    const rating = getPlanRating(plan);
    const tasks = plan.tasks || [];
    const completionPct = tasks.length
      ? Math.round((completedTaskIds.length / tasks.length) * 100)
      : 0;

    const tasksHTML = tasks.length
      ? tasks.map((task) => {
          const checked = completedTaskIds.includes(task.id);

          return `
            <div class="task-item${checked ? ' is-complete' : ''}" id="task-${task.id}">
              <input
                class="task-check"
                type="checkbox"
                data-task-id="${task.id}"
                ${checked ? 'checked' : ''}
                onchange="onTaskToggle(this)"
              />

              <div class="task-content">
                <span class="task-day">Day ${task.day}</span>
                <h4>${escapeHtml(task.title)}</h4>
                <p class="task-description">${escapeHtml(task.description)}</p>
              </div>
            </div>
          `;
        }).join('')
      : renderEmptyState('No tasks yet', 'This plan has not added any task details yet.');

    const starsHTML = [1, 2, 3, 4, 5].map((value) => `
      <span class="star-input" data-value="${value}">&#9733;</span>
    `).join('');

    container.innerHTML = `
      <section class="study-hero">
        <div class="study-hero-main">
          <span class="study-subject">${subject}</span>
          <h1>${title}</h1>
          <p>${description}</p>

          <div class="study-meta">
            <span class="meta-pill">${duration} day${duration === 1 ? '' : 's'}</span>
            <span class="meta-pill">${followers} follower${followers === 1 ? '' : 's'}</span>
            <span class="meta-pill">${tasks.length} task${tasks.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <aside class="study-side">
          <div class="study-side-card">
            <strong>${formatRatingValue(rating)}</strong>
            <span>Average rating from the community</span>
          </div>
          <div class="study-side-card">
            <strong>${completionPct}%</strong>
            <span>Your current completion status for this plan</span>
          </div>
          <div class="study-side-card">
            <strong>${followers}</strong>
            <span>Learners currently following this plan</span>
          </div>
        </aside>
      </section>

      <div class="study-layout-grid">
        <section class="study-section">
          <h2>Daily Tasks</h2>
          <p class="study-section-subtitle">Work through each day and save progress whenever you are ready.</p>
          <div class="task-list" id="taskList">${tasksHTML}</div>
        </section>

        <div class="study-aside-stack">
          <section class="study-section">
            <h2>Progress</h2>
            <div class="progress-card">
              <div class="progress-summary">
                <div>
                  <p class="study-section-subtitle">Completed tasks</p>
                  <strong class="progress-value" id="progressValue">${completedTaskIds.length}/${tasks.length || 0}</strong>
                </div>
                <p id="progressText">${completionPct}% complete</p>
              </div>

              <div class="progress-bar">
                <div class="progress-fill" id="progressFill" style="width: ${completionPct}%"></div>
              </div>

              ${isAuthenticated()
                ? `<button type="button" class="btn btn-primary" onclick="saveProgress(${planId})">Save Progress</button>`
                : '<button type="button" class="btn btn-secondary" onclick="openSignin()">Login to track progress</button>'}
            </div>
          </section>

          <section class="study-section">
            <h2>Community</h2>
            <p class="study-section-subtitle">Follow this plan and help surface the strongest learning paths.</p>
            <div class="rating-display">
              <span>${renderStars(rating)}</span>
              <span>${formatRatingValue(rating)}</span>
            </div>

            ${isAuthenticated()
              ? `
                <div class="rating-group" id="ratingGroup">${starsHTML}</div>
                <div class="footer-actions">
                  <button type="button" class="btn btn-primary" onclick="submitRating(${planId})">Submit Rating</button>
                  <button type="button" class="btn btn-secondary" onclick="toggleFollow(${planId}, ${isFollowing})">${isFollowing ? 'Unfollow Plan' : 'Follow Plan'}</button>
                </div>
              `
              : `
                <div class="footer-actions">
                  <button type="button" class="btn btn-primary" onclick="openSignin()">Login to Follow</button>
                  <button type="button" class="btn btn-secondary" onclick="openSignin()">Login to Rate</button>
                </div>
              `}
          </section>

          <section class="study-section">
            <h2>Navigation</h2>
            <p class="study-section-subtitle">Jump back to the library or return to your dashboard.</p>
            <div class="footer-actions">
              <button type="button" class="btn btn-secondary" onclick="history.back()">Go Back</button>
              <button type="button" class="btn btn-secondary" onclick="openWorkspace()">Dashboard</button>
            </div>
          </section>
        </div>
      </div>
    `;

    selectedRating = 0;
    const starEls = document.querySelectorAll('.star-input');
    starEls.forEach((star) => {
      star.addEventListener('click', () => {
        selectedRating = Number(star.dataset.value);
        updateStarDisplay(selectedRating);
      });

      star.addEventListener('mouseenter', () => {
        updateStarDisplay(Number(star.dataset.value));
      });

      star.addEventListener('mouseleave', () => {
        updateStarDisplay(selectedRating);
      });
    });
  } catch (error) {
    container.innerHTML = renderEmptyState(
      'Unable to load this plan',
      'The plan details could not be loaded right now.',
      pathToHome(),
      'Return home',
    );
    showMessage(error.message || 'Error loading plan details.', 'error');
  }
}

function onTaskToggle(checkbox) {
  const taskItem = checkbox.closest('.task-item');
  if (taskItem) {
    taskItem.classList.toggle('is-complete', checkbox.checked);
  }

  const allCheckboxes = document.querySelectorAll('#taskList input[type="checkbox"]');
  const checkedCount = Array.from(allCheckboxes).filter((cb) => cb.checked).length;
  const total = allCheckboxes.length;
  const pct = total ? Math.round((checkedCount / total) * 100) : 0;

  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  const value = document.getElementById('progressValue');

  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${pct}% complete`;
  if (value) value.textContent = `${checkedCount}/${total}`;
}

async function saveProgress(planId) {
  const completedTaskIds = Array.from(document.querySelectorAll('#taskList input[type="checkbox"]:checked'))
    .map((checkbox) => Number(checkbox.dataset.taskId));

  try {
    await studyPlanGateway.updateProgress(planId, completedTaskIds);
    showMessage('Progress saved successfully.', 'success');
  } catch (error) {
    showMessage(error.message || 'Failed to save progress.', 'error');
  }
}

function updateStarDisplay(value) {
  const stars = document.querySelectorAll('.star-input');
  stars.forEach((star) => {
    star.classList.toggle('active', Number(star.dataset.value) <= value);
  });
}

async function submitRating(planId) {
  if (!selectedRating) {
    showMessage('Select a rating before submitting.', 'error');
    return;
  }

  try {
    await studyPlanGateway.ratePlan(planId, selectedRating);
    showMessage('Rating submitted.', 'success');
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    showMessage(error.message || 'Failed to submit rating.', 'error');
  }
}

async function toggleFollow(planId, currentlyFollowing) {
  try {
    if (currentlyFollowing) {
      await studyPlanGateway.unfollowPlan(planId);
      showMessage('Plan unfollowed.', 'success');
    } else {
      await studyPlanGateway.followPlan(planId);
      showMessage('Plan followed.', 'success');
    }

    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    showMessage(error.message || 'Unable to update follow status.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavigation();

  switch (activeScreen) {
    case 'home':
      setupHomePage();
      break;
    case 'signin':
      bindSigninForm();
      break;
    case 'join':
      bindJoinForm();
      break;
    case 'workspace':
      hydrateWorkspace();
      break;
    case 'planner':
      bindPlannerForm();
      break;
    case 'plan-view':
      hydratePlanView();
      break;
    default:
      break;
  }
});
