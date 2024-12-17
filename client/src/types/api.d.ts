export type TPageInfo = {
  total: number;
  limit: number;
  offset: number;
  fetched: number;
};

export type TPaginatedResponse<T> = {
  results: T[];
  page_info: TPageInfo;
};
