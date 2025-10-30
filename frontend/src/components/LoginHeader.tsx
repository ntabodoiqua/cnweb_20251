import { HelpCircle } from "lucide-react";

const LoginHeader = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-foreground">Đăng nhập</h1>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-sm">Bạn cần giúp đỡ?</span>
                </button>
            </div>
        </header>
    );
};

export default LoginHeader;
