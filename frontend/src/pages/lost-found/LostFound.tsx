import { useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { Button } from "../../components/ui/button";
import { openPrintWindow, generateLuggageTagHtml } from "../../components/print/printPdf/BillPrintService";
import {
  useCreateLostFoundItemMutation,
  useDeleteLostFoundItemMutation,
  useGetLostFoundItemsQuery,
  useUpdateLostFoundItemMutation,
} from "../../store/services/lost-found/lostFoundSlice";
import { useGetSettingsQuery } from "../../store/services/settings/settingsSlice";
import type { LostAndFoundItem } from "../../utils/interfaces/Interface";
import { LostFoundKpiCards } from "./components/LostFoundKpiCards";
import { LostFoundFilters } from "./components/LostFoundFilters";
import { LostFoundTable } from "./components/LostFoundTable";
import { NewArticleModal } from "./components/NewArticleModal";
import { ClaimReturnModal } from "./components/ClaimReturnModal";

export default function LostFound() {
  const { data: items = [] } = useGetLostFoundItemsQuery();
  const { data: settings } = useGetSettingsQuery();

  const [createItem, { isLoading: isCreating }] = useCreateLostFoundItemMutation();
  const [updateItem] = useUpdateLostFoundItemMutation();
  const [deleteItem] = useDeleteLostFoundItemMutation();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [claimModalItem, setClaimModalItem] = useState<LostAndFoundItem | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.itemNo.toLowerCase().includes(query.toLowerCase()) ||
      item.locationFound.toLowerCase().includes(query.toLowerCase()) ||
      Boolean(item.guestName && item.guestName.toLowerCase().includes(query.toLowerCase()));
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesStat = selectedStatus === "ALL" || item.status === selectedStatus;
    return matchesQuery && matchesCat && matchesStat;
  });

  const securedCount = items.filter((i) => i.status === "SECURED").length;
  const notifiedCount = items.filter((i) => i.status === "GUEST_NOTIFIED").length;
  const claimedCount = items.filter((i) => i.status === "CLAIMED").length;

  const handleCreateSubmit = async (data: Parameters<typeof createItem>[0]) => {
    try {
      await createItem(data).unwrap();
      toast.success("Lost & Found article logged into custody register");
      setShowCreateModal(false);
    } catch {
      toast.error("Failed to log article");
    }
  };

  const handleClaimSubmit = async (item: LostAndFoundItem, claimantName: string, claimantContact: string) => {
    try {
      await updateItem({
        ...item,
        status: "CLAIMED",
        claimedAt: new Date().toISOString(),
        claimedBy: claimantName,
        claimantContact,
      }).unwrap();

      toast.success(`Article ${item.itemNo} marked as returned to guest`);
      setClaimModalItem(null);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this custody record?")) return;
    try {
      await deleteItem(id).unwrap();
      toast.success("Custody record removed");
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const handlePrintTag = (item: LostAndFoundItem) => {
    const html = generateLuggageTagHtml(item, settings);
    openPrintWindow(html);
  };

  return (
    <MainContainer>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle
          title="Lost & Found Custody Register"
          subtitle="Record found articles, maintain housekeeping custody, and print locker claim tags"
        />
        <Button variant="default" size="sm" onClick={() => setShowCreateModal(true)} className="gap-2 font-semibold">
          <Plus className="size-4" />
          <span>Log Found Article</span>
        </Button>
      </div>

      <div className="space-y-6">
        <LostFoundKpiCards
          totalCount={items.length}
          securedCount={securedCount}
          notifiedCount={notifiedCount}
          claimedCount={claimedCount}
        />

        <LostFoundFilters
          query={query}
          setQuery={setQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        <LostFoundTable
          items={filteredItems}
          onPrintTag={handlePrintTag}
          onInitiateClaim={setClaimModalItem}
          onDeleteItem={handleDelete}
        />
      </div>

      <NewArticleModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />

      <ClaimReturnModal
        item={claimModalItem}
        onClose={() => setClaimModalItem(null)}
        onSubmit={handleClaimSubmit}
      />
    </MainContainer>
  );
}
