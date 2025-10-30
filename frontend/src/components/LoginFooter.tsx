import { Mail, Phone, MapPin } from "lucide-react";

const LoginFooter = () => {
    return (
        <footer className="bg-secondary/30 border-t border-border py-8 mt-auto">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2 text-foreground">
                            <Mail className="w-5 h-5 text-primary" />
                            <span className="font-medium">Email</span>
                        </div>
                        <a href="mailto:contact@example.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            contact@example.com
                        </a>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2 text-foreground">
                            <Phone className="w-5 h-5 text-primary" />
                            <span className="font-medium">Điện thoại</span>
                        </div>
                        <a href="tel:+84123456789" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            +84 123 456 789
                        </a>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2 text-foreground">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="font-medium">Địa chỉ</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            123 Đường ABC, Quận 1, TP.HCM
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground">
                        © 2025 Your Company. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default LoginFooter;
