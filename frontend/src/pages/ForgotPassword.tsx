import LoginHeader from "../components/LoginHeader";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import LoginFooter from "../components/LoginFooter";
// @ts-ignore
import heroImage from "../assets/login-hero.jpg";

const ForgotPassword = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-subtle">
            <LoginHeader />

            <main className="flex-1 pt-16">
                <div className="container mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-16rem)]">
                        {/* Left side - Hero Image */}
                        <div className="hidden lg:block animate-fade-in">
                            <div className="relative rounded-3xl overflow-hidden shadow-medium">
                                <img
                                    src={heroImage}
                                    alt="Forgot Password Hero"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
                            </div>
                        </div>

                        {/* Right side - Forgot Password Form */}
                        <div className="flex justify-center lg:justify-end">
                            <ForgotPasswordForm />
                        </div>
                    </div>
                </div>
            </main>

            <LoginFooter />
        </div>
    );
};

export default ForgotPassword;
