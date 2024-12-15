import UploadFile from "@/components/file-upload/upload-file";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user || user.role === "guest") {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="max-w-4xl">
          <h2 className="text-4xl font-bold text-muted-foreground">
            You don't have permission to upload files because you are a Guest user.
          </h2>
        </div>
      </div>
    );
  }

  return <UploadFile />;
};

export default Home;
