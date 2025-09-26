import { MainLayout } from "@/components/layout/MainLayout";
import { AddRoomForm } from "@/components/admin/AddRoomForm";

const AddRoom = () => {
  return (
    <MainLayout activeTab="rooms">
      <AddRoomForm />
    </MainLayout>
  );
};

export default AddRoom;