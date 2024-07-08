export class PaginationWithItems<T> {
  public pagesCount: number;
  public items: T[]; // Явное объявление

  constructor(
    public page: number,
    public pageSize: number,
    public totalCount: number,
    items: T[],
  ) {
    this.pagesCount = Math.ceil(totalCount / pageSize); // Инициализация перед items
    this.items = items; // Присвоение значения
  }
}

//TODO убрать его
export class Paginator<T> {
  public pagesCount: number;
  public page: number;
  public pageSize: number;
  public totalCount: number;
  public items: T;

  static paginate<T>(data: { pageNumber: number; pageSize: number; totalCount: number; items: T }): Paginator<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: data.pageNumber,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
