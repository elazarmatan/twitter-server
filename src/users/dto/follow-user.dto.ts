import { IsString } from "class-validator";

export class FollowUserDto {
   @IsString()
  currentUser: string; // the user performing the action (optional, can come from JWT)
   @IsString()
  username: string; // the user to follow
}
