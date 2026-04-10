import { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import axios from "axios";
import { Company_API_END_POINT } from "../../../utils/constant.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import useGetCompanyById from "@/hooks/useGetCompanyById";

const CompanySetup = () => {
  const params = useParams();
  const navigate = useNavigate();

  // 🔥 Fetch company data
  useGetCompanyById(params.id);

  const { singleCompany } = useSelector((store) => store.company);

  const [input, setInput] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);

  // ✅ Handle text input
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // ✅ Handle file input
  const changeFileHandler = (e) => {
    const file = e.target.files[0];
    setInput({ ...input, file });
  };

  // ✅ Submit handler (FIXED)
  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading(true); // ✅ start loader

    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("website", input.website);
    formData.append("location", input.location);

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      const res = await axios.put(
        `${Company_API_END_POINT}/update/${params.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        toast.success(res.data.message);

        setLoading(false); // ✅ STOP loader
        navigate("/admin/companies"); // ✅ redirect
      } else {
        setLoading(false);
        toast.error("Update failed");
      }
    } catch (error) {
      console.log(error);
      setLoading(false); // ✅ STOP loader on error
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  // ✅ Set fetched data
  useEffect(() => {
    if (singleCompany) {
      setInput({
        name: singleCompany.name || "",
        description: singleCompany.description || "",
        website: singleCompany.website || "",
        location: singleCompany.location || "",
        file: null, // ❗ never prefill file
      });
    }
  }, [singleCompany]);

  return (
    <div>
      <Navbar />

      <div className="max-w-xl mx-auto my-10 bg-white p-6 rounded shadow">
        <form onSubmit={submitHandler}>
          {/* Header */}
          <div className="flex items-center gap-5 mb-6">
            <Button
              type="button"
              onClick={() => navigate("/admin/companies")}
              variant="outline"
              className="flex items-center gap-2 text-gray-500 font-semibold"
            >
              <ArrowLeft />
              <span>Back</span>
            </Button>

            <h1 className="font-bold text-xl">Company Setup</h1>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input
                type="text"
                name="name"
                value={input.name}
                onChange={changeEventHandler}
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                type="text"
                name="description"
                value={input.description}
                onChange={changeEventHandler}
              />
            </div>

            <div>
              <Label>Website</Label>
              <Input
                type="text"
                name="website"
                value={input.website}
                onChange={changeEventHandler}
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                onChange={changeEventHandler}
              />
            </div>

            <div className="col-span-2">
              <Label>Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={changeFileHandler}
              />
            </div>
          </div>

          {/* ✅ FIXED BUTTON */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-8 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Updating..." : "Update"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;