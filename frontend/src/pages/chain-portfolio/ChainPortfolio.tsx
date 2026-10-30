import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Search } from "lucide-react";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { Button } from "../../components/ui/button";
import {
  useCreatePropertyMutation,
  useDeletePropertyMutation,
  useGetPropertiesQuery,
  useSwitchActivePropertyMutation,
  useUpdatePropertyMutation,
} from "../../store/services/property/propertySlice";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import type { HotelProperty } from "../../utils/interfaces/Interface";
import { ChainPortfolioKpis } from "./components/ChainPortfolioKpis";
import { ChainPropertyCard } from "./components/ChainPropertyCard";
import { NewHotelModal } from "./components/NewHotelModal";
import { EditHotelModal } from "./components/EditHotelModal";

export default function ChainPortfolio() {
  const navigate = useNavigate();
  const { data: properties = [] } = useGetPropertiesQuery();
  const [switchProperty] = useSwitchActivePropertyMutation();
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
  const [deleteProperty] = useDeletePropertyMutation();

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<HotelProperty | null>(null);

  useEffect(() => {
    setEditingProperty((current) => {
      if (!current) return current;
      return properties.find((property) => property.id === current.id) ?? null;
    });
  }, [properties]);

  const filteredProperties = properties.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.brandTier?.toLowerCase().includes(q)
    );
  });

  const handleSwitch = async (id: string) => {
    try {
      const target = await switchProperty(id).unwrap();
      toast.success(`Active dashboard switched to: ${target.name}`);
      navigate(AppEndPoints.DASHBOARD);
    } catch {
      toast.error("Failed to switch active property");
    }
  };

  const handleCreate = async (data: Partial<HotelProperty>) => {
    try {
      const created = await createProperty(data).unwrap();
      toast.success(`Added ${created.name} to chain portfolio!`);
      setShowAddModal(false);
    } catch {
      toast.error("Failed to create property");
    }
  };

  const handleUpdate = async (data: HotelProperty) => {
    try {
      await updateProperty(data).unwrap();
      toast.success(`Updated settings for ${data.name}`);
      setEditingProperty(null);
    } catch {
      toast.error("Failed to update property");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this property from the chain portfolio?")) return;
    try {
      await deleteProperty(id).unwrap();
      toast.success("Hotel removed from chain portfolio");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove property");
    }
  };

  return (
    <MainContainer>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle
          title="Hotel Chain Portfolio & Multi-Property Manager"
          subtitle="Consolidated portfolio performance, individual property dashboards, and centralized management"
        />
        <Button variant="default" size="sm" onClick={() => setShowAddModal(true)} className="gap-2 font-semibold">
          <Plus className="size-4" />
          <span>Add New Hotel</span>
        </Button>
      </div>

      <div className="space-y-6">
        <ChainPortfolioKpis properties={properties} />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="relative min-w-[260px] flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hotel name, city, brand tier..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredProperties.length}</strong> of{" "}
            {properties.length} chain hotels
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((prop) => (
            <ChainPropertyCard
              key={prop.id}
              property={prop}
              onSwitch={handleSwitch}
              onEdit={setEditingProperty}
              onDelete={handleDelete}
              canDelete={properties.length > 1}
            />
          ))}
        </div>
      </div>

      <NewHotelModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      <EditHotelModal
        property={editingProperty}
        open={Boolean(editingProperty)}
        onClose={() => setEditingProperty(null)}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
      />
    </MainContainer>
  );
}
