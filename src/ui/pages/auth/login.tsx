import { useState } from "react";
import { TLogin } from "../../types/login.type";
import useForm, { IValidation } from "../../hooks/useForm";
import { Progress } from "../../components/ui/progress";
import { Input } from "../../components/ui/input";
import { EyeClosedIcon, EyeIcon, UserIcon } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { userCookies } from "../../utils/cookies";
import { useLoginMutation } from "../../../redux/auth/mutation";

const Login = () => {
  const [isVisible, setIsVisible] = useState(false);

  // redux component
  const [login, { isLoading }] = useLoginMutation();

  // local state
  const toggleVisibility = () => setIsVisible(!isVisible);

  const defaultValues: TLogin = {
    username: "",
    password: "",
    rememberMe: false,
  };

  const defaultValidation: IValidation = {
    username: {
      is_required: true,
      error_message: "Username is required field",
    },
    password: {
      is_required: true,
      error_message: "Password is required field",
    },
    rememberMe: {
      is_required: false,
      error_message: "Remember is required field",
    },
  };

  const onSubmit = async (form_data: any) => {
    try {
      const response: any = await login(form_data).unwrap();
      console.log("🚀 ~ onSubmit ~ response:", response);

      if (response?.code === 200 || response?.success) {
        toast.success(response?.message || "Login successful!");
        console.log(
          "🚀 ~ onSubmit ~ result:",
          response?.data || response?.result
        );

        // Store user data with rememberMe preference
        const userData = response?.data || response?.result;
        if (userData && userData.token) {
          userCookies.setUserData(userData, form_data.rememberMe);

          // Optionally redirect or trigger app state update here
          console.log(
            "🚀 ~ User data stored with rememberMe:",
            form_data.rememberMe
          );
        }
      } else {
        toast.error(response?.message || "Login failed!");
      }
    } catch (error: any) {
      console.log("🚀 ~ onSubmit ~ error:", error);

      if (error?.status === "FETCH_ERROR") {
        console.error("🚀 ~ Network error details:", error);
        toast.error(
          "Network error: Unable to connect to server. This might be a CORS issue or network connectivity problem."
        );
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else if (error?.error) {
        toast.error(error.error);
      } else {
        toast.error("Something went wrong! Please try again.");
      }
    }
  };

  const { form, validations, handleChange, handleSubmit, errors } = useForm({
    defaultValues,
    defaultValidation,
    onSubmit,
  });

  return (
    <div className="auth_background h-screen w-full">
      <div className="grid h-screen place-items-center">
        <div className="p-3 py-5 md:px-10 bg-background rounded-md shadow-lg drop-shadow-lg">
          <header className="flex justify-center my-3 gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Login your Chat App
            </h1>
          </header>
          <Progress
            aria-label="Loading..."
            className="max-w-md"
            isIndeterminate={isLoading}
            size="sm"
          />
          <form
            className="flex w-full flex-col gap-3 mt-3"
            onSubmit={handleSubmit}
          >
            <Input
              className="w-full bg-background text-foreground md:min-w-80"
              endContent={
                <UserIcon className="pointer-events-none text-2xl text-foreground" />
              }
              errorMessage={errors?.username ? errors?.username : ""}
              disabled={isLoading}
              isInvalid={errors?.username ? true : false}
              label={
                <span className="text-foreground">
                  Username{" "}
                  {validations?.username?.is_required && (
                    <span className="text-danger">*</span>
                  )}
                </span>
              }
              labelPlacement="outside"
              name="username"
              placeholder="Enter your username"
              type="text"
              value={form?.username?.toString() || ""}
              onChange={(e) => handleChange("username", e.target.value)}
            />
            <Input
              className="w-full bg-background text-foreground md:min-w-80"
              endContent={
                <button
                  className="mt-1"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeIcon className="pointer-events-none text-2xl text-foreground" />
                  ) : (
                    <EyeClosedIcon className="pointer-events-none text-2xl text-foreground" />
                  )}
                </button>
              }
              errorMessage={errors?.password ? errors?.password : ""}
              disabled={isLoading}
              isInvalid={errors?.password ? true : false}
              label={
                <span className="text-foreground">
                  Password
                  {validations?.password?.is_required && (
                    <span className="text-danger">*</span>
                  )}
                </span>
              }
              labelPlacement="outside"
              name="password"
              placeholder="Enter your password"
              type={isVisible ? "text" : "password"}
              value={form?.password?.toString() || ""}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <div className="flex text-foreground items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  className="bg-foreground"
                  id="rememberMe"
                  disabled={isLoading}
                  onCheckedChange={(checked) =>
                    handleChange("rememberMe", checked)
                  }
                />
                <Label htmlFor="rememberMe">Remember me</Label>
              </div>
            </div>
            <Button
              className="bg-primary cursor-pointer font-medium text-light dark:bg-secondary"
              disabled={isLoading}
              type="submit"
              size={"lg"}
            >
              Log in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
