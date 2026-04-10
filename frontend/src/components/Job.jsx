import { Bookmark } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const Job = ({ job = {} }) => {
  const navigate = useNavigate();

  if (!job || Object.keys(job).length === 0) return null;

  const daysAgoFunction = (mongodbTime) => {
    if (!mongodbTime) return 0;
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  };

  const daysAgo = daysAgoFunction(job.createdAt);

  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100">
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`}
        </p>

        <Button variant="outline" className="rounded-full" size="icon">
          <Bookmark />
        </Button>
      </div>

      <div className="flex items-center gap-2 my-4">
        <Button className="p-6" variant="outline" size="icon">
          <Avatar>
            <AvatarImage src={job?.company?.logo || ""} />
          </Avatar>
        </Button>

        <div>
          <h1 className="font-semibold">{job?.company?.name || "Company Name"}</h1>
          <p className="text-sm text-gray-500">India</p>
        </div>
      </div>

      <div>
        <h1 className="font-bold text-lg my-2">{job?.title || "Job Title"}</h1>
        <p className="text-sm text-gray-600 line-clamp-2">
          {job?.description || "No description available"}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <Badge className="text-blue-700 font-bold" variant="ghost">
          {job?.position || 0} Positions
        </Badge>

        <Badge className="text-red-700 font-bold" variant="ghost">
          {job?.jobType || "Full Time"}
        </Badge>

        <Badge className="text-purple-600 font-bold" variant="ghost">
          {job?.salary || 0} LPA
        </Badge>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/description/${job?._id}`)}
        >
          Details
        </Button>

        <Button className="bg-purple-600 hover:bg-purple-700">
          Save For Later
        </Button>
      </div>
    </div>
  );
};

export default Job;