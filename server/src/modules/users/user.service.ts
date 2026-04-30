import * as userModel from './user.store';

export const getUserProfile = async (userId: number) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  const ownedPlans = await userModel.getUserCreatedPlans(userId);
  const savedPlans = await userModel.getUserFollowedPlans(userId);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    ownedPlans,
    savedPlans,
    createdPlans: ownedPlans,
    followedPlans: savedPlans,
  };
};
