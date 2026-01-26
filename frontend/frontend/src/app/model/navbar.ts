export interface NavbarItem {
  label: string;
  route?: string;
  icon?: string;
  children?: NavbarItem[];
}