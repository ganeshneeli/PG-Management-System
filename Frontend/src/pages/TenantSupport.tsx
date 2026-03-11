import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, MapPin, Building2 } from "lucide-react";

export default function TenantSupport() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Contact PG Manager</h1>
                <p className="text-sm text-muted-foreground">Get in touch with the management for support or queries</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/20 bg-primary/[0.02]">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" /> Management Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">PG Address</p>
                                <p className="text-sm text-muted-foreground">123, Luxury Living PG, Near Tech Park, HSR Layout, Bengaluru - 560102</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                                <p className="font-semibold text-sm">Manager Phone</p>
                                <p className="text-sm text-muted-foreground">+91 91234 56789</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                                <p className="font-semibold text-sm">Email Support</p>
                                <p className="text-sm text-muted-foreground">support@modernpg.com</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" /> Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start py-6" variant="outline" asChild>
                            <a href="tel:+919123456789">
                                <Phone className="mr-3 h-5 w-5 text-green-600" />
                                <div className="text-left">
                                    <p className="font-bold">Call Manager</p>
                                    <p className="text-[10px] text-muted-foreground">Direct line for emergencies</p>
                                </div>
                            </a>
                        </Button>
                        <Button className="w-full justify-start py-6" variant="outline" asChild>
                            <a href="https://wa.me/919123456789" target="_blank" rel="noreferrer">
                                <MessageSquare className="mr-3 h-5 w-5 text-green-500" />
                                <div className="text-left">
                                    <p className="font-bold">WhatsApp Support</p>
                                    <p className="text-[10px] text-muted-foreground">Chat for maintenance updates</p>
                                </div>
                            </a>
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                            Manager is available Mon-Sat, 9 AM - 8 PM
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
