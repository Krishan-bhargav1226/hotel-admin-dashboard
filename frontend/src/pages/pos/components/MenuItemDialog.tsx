import type { FormEvent, Dispatch, SetStateAction } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import UiDialog from "../../../components/ui/models/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import type { MenuCategory, MenuItem as MenuCatalogItem } from "../../../utils/interfaces/Interface";

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  BREAKFAST: "Breakfast",
  MAIN_COURSE: "Main Course & Meals",
  SNACKS: "Snacks & Starters",
  BEVERAGES: "Beverages & Coffee",
  LAUNDRY: "Laundry & Ironing",
  EXTRA_SERVICE: "Amenities & Taxi",
};

interface MenuItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  item: Partial<MenuCatalogItem>;
  setItem: Dispatch<SetStateAction<Partial<MenuCatalogItem>>>;
  isSaving: boolean;
}

export default function MenuItemDialog({ open, onClose, onSubmit, item, setItem, isSaving }: MenuItemDialogProps) {
  return (
    <UiDialog open={open} onClose={onClose} title="Setup Menu / Amenity Item" maxWidth="xs">
      <form onSubmit={onSubmit} className="space-y-4 pt-1">
        <TextField label="Item / Service Name *" required fullWidth size="small" value={item.name || ""} onChange={(event) => setItem({ ...item, name: event.target.value })} />
        <FormControl fullWidth size="small">
          <InputLabel>Category</InputLabel>
          <Select value={item.category || "MAIN_COURSE"} label="Category" onChange={(event) => setItem({ ...item, category: event.target.value as MenuCategory })}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Price (₹) *" type="number" required fullWidth size="small" value={item.price || 0} onChange={(event) => setItem({ ...item, price: Number(event.target.value) })} />
        <TextField label="Description (Optional)" multiline rows={2} fullWidth size="small" value={item.description || ""} onChange={(event) => setItem({ ...item, description: event.target.value })} />
        <DialogActions className="!px-0 !pt-2">
          <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>Cancel</Button>
          <UISubmitButton type="submit" text="Save Item" loading={isSaving} />
        </DialogActions>
      </form>
    </UiDialog>
  );
}
