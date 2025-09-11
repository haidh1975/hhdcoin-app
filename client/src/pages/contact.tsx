import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ContactSupport from "@/components/contact-support";
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
      label: t("contact.phone_label"),
      value: "+84 888151975",
      link: "tel:+84888151975"
    },
    {
      icon: MapPin,
      label: t("contact.address_label"),
      value: "Số 25, ngõ 155 đường Cầu Giấy, TP. Hà Nội",
      link: null
    },
    {
      icon: SiFacebook,
      label: t("contact.facebook_label"),
      value: t("contact.zalo_support"),
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
            {t('contact.page_subtitle')}
          </p>
        </div>
      </section>

      <section className="py-16" data-testid="section-contact-info">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-contact-info-title">
              {t('contact.info_title')}
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
              {t('contact.office_title')}
            </h2>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-bitcoin to-bitcoin-light text-white p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <MapPin className="h-8 w-8" />
                    <h3 className="text-2xl font-bold">{t('contact.headquarters')}</h3>
                  </div>
                  <p className="text-lg opacity-90">
                    {t('contact.full_address')}
                  </p>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-2">{t('contact.working_hours')}</h4>
                      <p className="text-gray-600">{t('contact.monday_friday')}</p>
                      <p className="text-gray-600">{t('contact.saturday')}</p>
                      <p className="text-gray-600">{t('contact.sunday')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{t('contact.support_24_7')}</h4>
                      <p className="text-gray-600">{t('contact.ai_chatbot')}</p>
                      <p className="text-gray-600">{t('contact.email_support')}</p>
                      <p className="text-gray-600">{t('contact.zalo_consultation')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <ContactSupport />

      <Footer />
    </div>
  );
}