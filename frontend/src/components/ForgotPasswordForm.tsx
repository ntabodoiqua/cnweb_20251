import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Password reset request for:", email);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-card rounded-2xl shadow-medium p-8 border border-border text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-3">
                        Kiểm tra email của bạn
                    </h2>

                    <p className="text-muted-foreground mb-6">
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong className="text-foreground">{email}</strong>
                    </p>

                    <p className="text-sm text-muted-foreground mb-6">
                        Không nhận được email? Kiểm tra thư mục spam hoặc thử gửi lại sau vài phút.
                    </p>

                    <Link to="/">
                        <Button className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
                            Quay lại đăng nhập
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md animate-fade-in">
            <div className="bg-card rounded-2xl shadow-medium p-8 border border-border">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại đăng nhập
                </Link>

                <h2 className="text-2xl font-bold text-foreground mb-2">Quên mật khẩu?</h2>
                <p className="text-muted-foreground mb-6">
                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                </p>

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

                    <Button
                        type="submit"
                        className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium"
                    >
                        Gửi hướng dẫn
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
