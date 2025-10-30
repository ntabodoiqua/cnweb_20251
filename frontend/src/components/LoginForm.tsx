import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Facebook, Mail } from "lucide-react";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt:", { email, password });
    };

    return (
        <div className="w-full max-w-md animate-fade-in">
            <div className="bg-card rounded-2xl shadow-medium p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Chào mừng trở lại</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Mật khẩu
                            </Label>
                            <a
                                href="#"
                                className="text-sm text-primary hover:text-primary-hover transition-colors"
                            >
                                Quên mật khẩu?
                            </a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
                        Đăng nhập
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-muted-foreground">Hoặc đăng nhập với</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 border-border hover:bg-secondary"
                        onClick={() => console.log("Facebook login")}
                    >
                        <Facebook className="w-5 h-5 mr-2" />
                        Facebook
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 border-border hover:bg-secondary"
                        onClick={() => console.log("Google login")}
                    >
                        <Mail className="w-5 h-5 mr-2" />
                        Google
                    </Button>
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Chưa có tài khoản?{" "}
                    <a href="#" className="text-primary hover:text-primary-hover font-medium transition-colors">
                        Đăng ký ngay
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
