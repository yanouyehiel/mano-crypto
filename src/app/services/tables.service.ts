import { DecimalPipe } from '@angular/common';
import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, of, Observable, Subject, tap, debounceTime, switchMap, delay } from 'rxjs';
import { TableUser } from '../models/Table';
import {SortColumn, SortDirection} from '../directives/sortable.directive';
import { UserService } from './user.service';

interface SearchResult {
  basicTable: TableUser[];
  total: number;
  
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(basicTable: TableUser[], column: SortColumn, direction: string): TableUser[] {
  if (direction === '' || column === '') {
    return basicTable;
  } else {
    return [...basicTable].sort((a: any, b: any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(table: TableUser, term: string, pipe: PipeTransform) {
  return table.name.toLowerCase().includes(term.toLowerCase())
  || pipe.transform(table.id).includes(term)

}
@Injectable({
  providedIn: 'root'
})
export class TablesService {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _search$ = new Subject<void>();
    private _tables$ = new BehaviorSubject<TableUser[]>([]);
    private _total$ = new BehaviorSubject<number>(0);

    public TABLEDATA: any[] = [];
  
    private _state: State = {
      page: 1,
      pageSize: 4,
      searchTerm: '',
      sortColumn: '',
      sortDirection: ''
    };

  constructor(private pipe: DecimalPipe, private userService: UserService) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe(result => {
        this._tables$.next(result.basicTable);
        this._total$.next(result.total);
      });
    this._search$.next();
    this.userService.getUsersByCountryCode('+237').subscribe((res: any) => {
      this.TABLEDATA = res.data
    })
    console.log(this.TABLEDATA)
   }

  get basicTable$() { return this._tables$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;
 
    
    // 1. sort
    let basicTable = sort(this.TABLEDATA, sortColumn, sortDirection);

    // 2. filter
    basicTable = basicTable.filter(country => matches(country, searchTerm, this.pipe));

    
    const total = basicTable.length;

    // 3. paginate
    basicTable = basicTable.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({basicTable, total});
  }
}