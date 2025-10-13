import { MainLayout } from "@/components/layout/MainLayout";
import { AddRoomWizard } from "@/components/admin/AddRoomWizard";
// import { AddRoomForm } from "@/components/admin/AddRoomForm"; // Old form - kept for reference

const AddRoom = () => {
  return (
    <MainLayout activeTab="rooms">
      <AddRoomWizard />
    </MainLayout>
  );
};

export default AddRoom;