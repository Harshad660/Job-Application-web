import  { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { USER_API_END_POINT } from "../../../utils/constant.js";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../../../redux/authSlice.js";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "student", // default role
  });

  const { loading, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle input changes
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // Handle radio group change
  const roleChangeHandler = (value) => {
    setInput({ ...input, role: value });
  };

  // Submit login
  const submitHandler = async (e) => {
    e.preventDefault();

    // Validation
    if (!input.email || !input.password || !input.role) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        // Store token in localStorage
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        toast.success(res.data.message);
        
        // Direct redirect for admin
        if(res.data.user.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Server error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-md border border-gray-400 rounded-md p-6 my-10"
        >
          <h1 className="font-bold text-2xl mb-6 text-center">Log In</h1>

          {/* Email */}
          <div className="mb-4">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="youremail@example.com"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
            />
          </div>

          {/* Role */}
          <div className="mb-6">
            <Label>Role</Label>
            <RadioGroup
              value={input.role}
              onValueChange={roleChangeHandler}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="recruiter" id="recruiter" />
                <Label htmlFor="recruiter">Recruiter</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit button */}
          {loading ? (
            <Button className="w-full flex justify-center items-center gap-2 my-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">
              Login
            </Button>
          )}

          <p className="text-sm text-center mt-3">
            Don't have an account?{""}
            <Link to="/signup" className="text-blue-600">
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
