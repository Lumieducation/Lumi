export default interface MenuItem {
  label: string;
  accelerator?: string;
  click?: () => void;
  submenu?: MenuItem[];
}
