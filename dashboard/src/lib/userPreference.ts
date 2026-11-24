const NUM_USERS_PER_PAGE_LOCAL_STORAGE_KEY = "vantray-num-users-per-page";
const NUM_USERS_PER_PAGE_DEFAULT = 10;

export const getUsersPerPageLimitSize = () => {
  const numUsersPerPage =
    localStorage.getItem(NUM_USERS_PER_PAGE_LOCAL_STORAGE_KEY) ||
    NUM_USERS_PER_PAGE_DEFAULT.toString();
  return parseInt(numUsersPerPage) || NUM_USERS_PER_PAGE_DEFAULT;
};

export const setUsersPerPageLimitSize = (value: string) => {
  return localStorage.setItem(NUM_USERS_PER_PAGE_LOCAL_STORAGE_KEY, value);
};
