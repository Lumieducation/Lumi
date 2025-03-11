export default interface MenuItem {
  label: string;
  accelerator?: string;
  enabled?: boolean;
  click?: () => void;
  submenu?: MenuItem[];
}
