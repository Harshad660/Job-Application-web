import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2, Menu, X, Sparkles, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_END_POINT } from "../../../utils/constant.js";
import { setUser } from "../../../redux/authSlice.js";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/">
            <h1 className="text-xl md:text-2xl font-bold">
              Job<span className="text-yellow-500">Hunt</span>
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-6 font-medium">
              {user?.role === "recruiter" ? (
                <>
                  <li>
                    <Link className="hover:text-purple-600 dark:hover:text-purple-400" to="/admin/companies">
                      Companies
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-purple-600 dark:hover:text-purple-400" to="/admin/jobs">
                      Jobs
                    </Link>
                  </li>
                </>
              ) : user?.role === "admin" ? (
                <>
                  <li>
                    <Link className="hover:text-purple-600 dark:hover:text-purple-400" to="/admin/dashboard">
                      Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-purple-600 dark:hover:text-purple-400" to="/admin/main/users">
                      Users
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-purple-600 dark:hover:text-purple-400" to="/admin/main/jobs">
                      Platform Jobs
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link className="hover:text-purple-600 dark:hover:text-purple-400" to="/">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-purple-600 dark:hover:text-purple-400" to="/jobs">
                      Jobs
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-purple-600 dark:hover:text-purple-400" to="/browse">
                      Browse
                    </Link>
                  </li>
                  <li>
                    <Popover>
                        <PopoverTrigger className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-yellow-500" /> AI Tools
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 flex flex-col gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700">
                            <Link to="/ai/resume-analyzer" className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded block">ATS Analyzer</Link>
                            <Link to="/ai/resume-builder" className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded block">Smart Resume Builder</Link>
                            <Link to="/ai/mock-interview" className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded block">Mock Interview</Link>
                        </PopoverContent>
                    </Popover>
                  </li>
                </>
              )}
            </ul>

            {!user ? (
              <div className="flex gap-3">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-gray-300 dark:border-gray-700"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                    Signup
                  </Button>
                </Link>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer border border-gray-300 dark:border-gray-700">
                    <AvatarImage src={user?.profile?.profilePhoto} />
                    <AvatarFallback>
                      {user?.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </PopoverTrigger>

                <PopoverContent className="w-72 bg-white dark:bg-gray-800 border dark:border-gray-700">
                  <div className="flex gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={user?.profile?.profilePhoto} />
                      <AvatarFallback>
                        {user?.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{user?.fullName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.profile?.bio}
                      </p>
                    </div>
                  </div>

                  {(user?.role === "student" || user?.role === "admin") && (
                    <Link to={user?.role === "admin" ? "/admin/dashboard" : "/profile"}>
                      <Button variant="ghost" className="flex gap-2 w-full justify-start">
                        {user?.role === "admin" ? <LayoutDashboard size={18} /> : <User2 size={18} />}
                        {user?.role === "admin" ? "Admin Dash" : "Profile"}
                      </Button>
                    </Link>
                  )}

                  <Button
                    onClick={logoutHandler}
                    variant="ghost"
                    className="flex gap-2 w-full justify-start text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <LogOut size={18} /> Logout
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg mt-2 p-4 space-y-4 transition-all">
            {user?.role === "recruiter" ? (
              <>
                <Link to="/admin/companies" onClick={() => setOpen(false)} className="block">
                  Companies
                </Link>
                <Link to="/admin/jobs" onClick={() => setOpen(false)} className="block">
                  Jobs
                </Link>
              </>
            ) : user?.role === "admin" ? (
              <>
                <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="block">
                  Admin Dashboard
                </Link>
                <Link to="/admin/main/users" onClick={() => setOpen(false)} className="block">
                  Manage Users
                </Link>
                <Link to="/admin/main/jobs" onClick={() => setOpen(false)} className="block">
                  Manage Platform Jobs
                </Link>
              </>
            ) : (
              <>
                <Link to="/" onClick={() => setOpen(false)} className="block">
                  Home
                </Link>
                <Link to="/jobs" onClick={() => setOpen(false)} className="block">
                  Jobs
                </Link>
                <Link to="/browse" onClick={() => setOpen(false)} className="block">
                  Browse
                </Link>
                <Link to="/ai/resume-analyzer" onClick={() => setOpen(false)} className="block text-purple-600">
                  AI Resume Analyzer
                </Link>
                <Link to="/ai/resume-builder" onClick={() => setOpen(false)} className="block text-purple-600">
                  AI Resume Builder
                </Link>
                <Link to="/ai/mock-interview" onClick={() => setOpen(false)} className="block text-purple-600">
                  AI Mock Interview
                </Link>
              </>
            )}

            {!user ? (
              <div className="flex flex-col gap-3 pt-3">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
                    Signup
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                onClick={logoutHandler}
                className="w-full bg-red-500 hover:bg-red-600 mt-3 text-white"
              >
                Logout
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;