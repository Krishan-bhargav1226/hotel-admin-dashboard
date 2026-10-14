import { CircularProgress } from "@mui/material";

const LoadingTable = () => {
  return (
    <div className="flex justify-center items-center">
      <CircularProgress 
        size={40}
        thickness={3}
        sx={{
          color: "#27336B"
        }}
      />
    </div>
  );
};

export default LoadingTable;