import { useEffect } from "react";

const SEOHead = () => {
  useEffect(() => {
    // Inject JSON-LD structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SportStock",
      url: "https://sportstock.app",
      logo: "https://sportstock.app/favicon.ico",
      description:
        "The world's first sports stock exchange. Buy and sell shares of your favorite athletes with real-time stats and instant ROI.",
      sameAs: [],
      foundingDate: "2026",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "English",
      },
    });
    script.id = "org-schema";
    if (!document.getElementById("org-schema")) {
      document.head.appendChild(script);
    }

    const productScript = document.createElement("script");
    productScript.type = "application/ld+json";
    productScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      name: "SportStock Athlete Shares",
      description:
        "Buy and sell shares of professional athletes. Trade sports stocks with real-time performance data, secure transactions, and instant portfolio tracking.",
      provider: {
        "@type": "Organization",
        name: "SportStock",
      },
      category: "Sports Investment Platform",
      feesAndCommissionsSpecification:
        "Low-fee trading with transparent commission structure",
    });
    productScript.id = "product-schema";
    if (!document.getElementById("product-schema")) {
      document.head.appendChild(productScript);
    }

    return () => {
      document.getElementById("org-schema")?.remove();
      document.getElementById("product-schema")?.remove();
    };
  }, []);

  return null;
};

export default SEOHead;
