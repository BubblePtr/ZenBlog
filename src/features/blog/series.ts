export const INDIE_DEV_WEEKLY_TAG = '独立开发周报';

export function isIndieDevWeeklyPost(tags: string[] | undefined): boolean {
  return tags?.includes(INDIE_DEV_WEEKLY_TAG) ?? false;
}
