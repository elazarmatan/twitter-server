export class FollowUserDto {
  username: string; // the user to follow
  currentUser?: string; // the user performing the action (optional, can come from JWT)
}
