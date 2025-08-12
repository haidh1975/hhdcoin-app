import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Phone, MapPin, MessageCircle, Video, HelpCircle, Book, Send, Info } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactSupport() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Thành công!",
        description: data.message || "Tin nhắn đã được gửi thành công!",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setPrivacyAccepted(false);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi gửi tin nhắn",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyAccepted) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đồng ý với chính sách bảo mật",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    contactMutation.mutate(formData);
  };

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      subtitle: "Trực tuyến",
      color: "text-bitcoin"
    },
    {
      icon: Video,
      title: "Video Call",
      subtitle: "Đặt lịch",
      color: "text-bitcoin"
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      subtitle: "Câu hỏi thường gặp",
      color: "text-bitcoin"
    },
    {
      icon: Book,
      title: "Hướng dẫn",
      subtitle: "Tài liệu chi tiết",
      color: "text-bitcoin"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white" data-testid="section-contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-contact-title">
            Liên hệ & Hỗ trợ
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-contact-description">
            Đội ngũ chuyên gia HHDcoin luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-bitcoin to-bitcoin-light text-white" data-testid="card-contact-info">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Thông tin liên hệ</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4" data-testid="contact-email">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-white text-xl h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Email</div>
                      <a href="mailto:haidh1975@gmail.com" className="opacity-90 hover:opacity-100" data-testid="link-email">
                        haidh1975@gmail.com
                      </a>
                      <div className="text-sm opacity-75">Phản hồi trong vòng 2 giờ</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4" data-testid="contact-phone">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="text-white text-xl h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Điện thoại</div>
                      <a href="tel:+84888151975" className="opacity-90 hover:opacity-100" data-testid="link-phone">
                        +84 888 151 975
                      </a>
                      <div className="text-sm opacity-75">Hỗ trợ 24/7</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4" data-testid="contact-address">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-white text-xl h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Địa chỉ</div>
                      <div className="opacity-90">Số 25, ngõ 155 đường Cầu Giấy</div>
                      <div className="opacity-90">Phường Quan Giấy, TP. Hà Nội</div>
                      <div className="text-sm opacity-75">Giờ làm việc: 8:00 - 22:00</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4" data-testid="contact-facebook">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <SiFacebook className="text-white text-xl h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Facebook</div>
                      <a 
                        href="https://www.facebook.com/profile.php?id=100067837153049" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="opacity-90 hover:opacity-100"
                        data-testid="link-facebook"
                      >
                        HHDcoin Official
                      </a>
                      <div className="text-sm opacity-75">Cập nhật tin tức mới nhất</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Support Options */}
            <Card className="bg-gray-50" data-testid="card-support-options">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-dark-slate mb-6">Tùy chọn hỗ trợ</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {supportOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-bitcoin transition-colors h-auto flex flex-col items-center"
                      data-testid={`button-support-option-${index}`}
                    >
                      <option.icon className={`${option.color} text-2xl mb-2 h-8 w-8`} />
                      <div className="font-semibold text-dark-slate">{option.title}</div>
                      <div className="text-sm text-gray-600">{option.subtitle}</div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Form */}
          <Card className="bg-gray-50" data-testid="card-contact-form">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-dark-slate mb-6">Gửi tin nhắn</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nhập họ tên..." 
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Nhập số điện thoại..." 
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email..." 
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề *
                  </Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder="Chọn chủ đề..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investment">Tư vấn đầu tư</SelectItem>
                      <SelectItem value="technical">Hỗ trợ kỹ thuật</SelectItem>
                      <SelectItem value="partnership">Hợp tác kinh doanh</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Nhập nội dung tin nhắn..." 
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className="resize-none"
                    required
                    data-testid="textarea-message"
                  />
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="privacy" 
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                    data-testid="checkbox-privacy"
                  />
                  <Label htmlFor="privacy" className="text-sm text-gray-600 leading-relaxed">
                    Tôi đồng ý với <a href="#" className="text-bitcoin hover:text-bitcoin-light">chính sách bảo mật</a> 
                    {" "}và <a href="#" className="text-bitcoin hover:text-bitcoin-light">điều khoản sử dụng</a>
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-bitcoin text-white py-4 rounded-lg font-semibold hover:bg-bitcoin-light transition-colors"
                  disabled={contactMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {contactMutation.isPending ? "Đang gửi..." : "Gửi tin nhắn"}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" data-testid="info-response-time">
                <div className="flex items-start space-x-3">
                  <Info className="text-blue-500 mt-1 h-5 w-5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <strong>Lưu ý:</strong> Chúng tôi cam kết phản hồi mọi tin nhắn trong vòng 2 giờ làm việc. 
                    Đối với các vấn đề khẩn cấp, vui lòng gọi trực tiếp hotline.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
