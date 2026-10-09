// Ported from com/jiggmin/pr3/lister/CategorySelector.as
import { int, $b } from '../../../flash/as3.ts';
import { Selector } from './Selector.ts';
import { DropdownEvent, EasyDropdown } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class CategorySelector extends Selector {
  static categoryMemory: any = ({} as any);
  static categoryLastPageMemory: any = ({} as any);
  static categoryDataMemory: any = ({} as any);
  static categoryResultsCount: any = ({} as any);
  declare defaultCategoryName: string;
  declare defaultCategoryId: string;
  declare categoryId: string;
  declare categoryDropdown: EasyDropdown;
  static clearCache(categoryName: string, categoryId: string): void {
         CategorySelector.categoryDataMemory[categoryName + "-" + categoryId] = null;
         CategorySelector.categoryLastPageMemory[categoryName + "-" + categoryId] = null;
         CategorySelector.categoryResultsCount[categoryName + "-" + categoryId] = null;
      }
  updateCategoryDropdownChildIndex(): void {
         this.setChildIndex(this.categoryDropdown,this.numChildren - 1);
      }
  setCategoryDropdownVisiblity(visiblity: boolean): void {
         this.categoryDropdown.visible = visiblity;
      }
  updateCategoryDropdownSize(): void {
         if(this.pagination)
         {
            this.categoryDropdown.width = this.getTargetWidth() - this.pagination.getHolder().width - 5;
         }
      }
  addCategoryAutomSelect(category: string, id: any = ""): void {
         this.categoryDropdown.addOption(category,id,this.categoryId == id);
      }
  addCategory(category: string, id: any = "", selected: boolean = false): void {
         this.categoryDropdown.addOption(category,id,selected);
      }
  setCategoryID(categoryId: string): void {
         this.categoryId = categoryId;
         CategorySelector.categoryMemory[this.paginationSlug] = categoryId;
      }
  getLastRememberedCategoryID(): string {
         if(CategorySelector.categoryMemory[this.paginationSlug] != null)
         {
            return CategorySelector.categoryMemory[this.paginationSlug];
         }
         return this.defaultCategoryId;
      }
  setCategoryData(categoryId: string, data: any): void {
         CategorySelector.categoryDataMemory[this.paginationSlug + "-" + categoryId] = data;
      }
  getLastRememberedCategoryData(): any {
         if(CategorySelector.categoryDataMemory[this.paginationSlug + "-" + this.categoryId] != null)
         {
            return CategorySelector.categoryDataMemory[this.paginationSlug + "-" + this.categoryId];
         }
         return null;
      }
  setCategoryLastPage(page: number): void {
         CategorySelector.categoryLastPageMemory[this.paginationSlug + "-" + this.categoryId] = page;
      }
  getLastRememberedCategoryPage(): number {
         if(CategorySelector.categoryLastPageMemory[this.paginationSlug + "-" + this.categoryId] != null)
         {
            return CategorySelector.categoryLastPageMemory[this.paginationSlug + "-" + this.categoryId];
         }
         return 1;
      }
  selectCategory(event: DropdownEvent): void {
         this.setCategoryLastPage(this.getLastRememberedPage());
         this.setCategoryID(event.data);
         this.setPageNum(this.getLastRememberedCategoryPage());
      }
  setCategoryResultsCount(categoryId: string, results: number): void {
         CategorySelector.categoryResultsCount[this.paginationSlug + "-" + categoryId] = results;
      }
  getLastRememberedCategoryResultsCount(): number {
         if(CategorySelector.categoryResultsCount[this.paginationSlug + "-" + this.categoryId] != null)
         {
            return CategorySelector.categoryResultsCount[this.paginationSlug + "-" + this.categoryId];
         }
         return -1;
      }
  constructor(elementsPerPage: number, defaultCategoryName: string, defaultCategoryId: string) {
    elementsPerPage = int(elementsPerPage);
         super(elementsPerPage);
         this.defaultCategoryName = defaultCategoryName;
         this.defaultCategoryId = defaultCategoryId;
         this.categoryId = this.getLastRememberedCategoryID();
         this.categoryDropdown = new EasyDropdown();
         this.categoryDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectCategory'),false,0,true);
         this.categoryDropdown.maxHeight = 200;
         this.updateCategoryDropdownSize();
         this.addChild(this.categoryDropdown);
         this.addCategoryAutomSelect(this.defaultCategoryName,this.defaultCategoryId);
      }
}
$reg('com.jiggmin.pr3.lister.CategorySelector', CategorySelector);
