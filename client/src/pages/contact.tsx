import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { SiFacebook } from "react-icons/si";

export default function Contact() {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "haidh1975@gmail.com",
      link: "mailto:haidh1975@gmail.com"
    },
    {
      icon: Phone,
      label: "Điện thoại",
      value: "+84 888151975",
      link: "tel:+84888151975"
    },
    {
      icon: MapPin,
      label: "Địa chỉ",
      value: "Số 25, ngõ 155 đường Cầu Giấy, TP. Hà Nội",
      link: null
    },
    {
      icon: SiFacebook,
      label: "Facebook",
      value: "Zalo hỗ trợ HHDcoin",
      link: null
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white py-20" data-testid="section-contact-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="text-contact-title">
            {t('contact.page_title')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Liên hệ với đội ngũ chuyên gia HHDcoin để được hỗ trợ tốt nhất về đầu tư Bitcoin
          </p>
        </div>
      </section>

      <section className="py-16" data-testid="section-contact-info">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-contact-info-title">
              Thông tin liên hệ
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                const content = (
                  <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-contact-${index}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Icon className="h-8 w-8 text-bitcoin" />
                        <span className="text-lg">{info.label}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {info.value}
                      </p>
                    </CardContent>
                  </Card>
                );
                
                if (info.link) {
                  return (
                    <a key={index} href={info.link} className="block" data-testid={`link-contact-${index}`}>
                      {content}
                    </a>
                  );
                }
                return content;
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16" data-testid="section-contact-map">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-office-title">
              Văn phòng HHDcoin
            </h2>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-bitcoin to-bitcoin-light text-white p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <MapPin className="h-8 w-8" />
                    <h3 className="text-2xl font-bold">Trụ sở chính</h3>
                  </div>
                  <p className="text-lg opacity-90">
                    Số 25, ngõ 155 đường Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Thành phố Hà Nội
                  </p>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-2">Giờ làm việc:</h4>
                      <p className="text-gray-600">Thứ 2 - Thứ 6: 9:00 - 18:00</p>
                      <p className="text-gray-600">Thứ 7: 9:00 - 12:00</p>
                      <p className="text-gray-600">Chủ nhật: Nghỉ</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Hỗ trợ 24/7:</h4>
                      <p className="text-gray-600">Chatbot AI luôn sẵn sàng</p>
                      <p className="text-gray-600">Email support</p>
                      <p className="text-gray-600">Zalo consultation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}