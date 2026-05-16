export default function PrivacyPolicyPage({ setPage }) {
  return (
    <div style={{minHeight:"100vh",background:"#07080f",paddingTop:62}}>
      <div style={{maxWidth:800,margin:"0 auto",padding:"40px 24px 80px"}}>
        <div className="fade-up" style={{marginBottom:36}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#4f8ef7",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Legal</div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(24px,4vw,36px)",color:"#fff",letterSpacing:"-1px",lineHeight:1.1}}>
            Privacy Policy
          </h1>
          <p style={{color:"#6b7280",fontSize:13,marginTop:8}}>Last updated: May 15, 2026</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <PrivacySection 
            title="1. Introduction" 
            content={`ProBeam Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website https://2dbeamcalculator.netlify.app (the "Site"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.`} 
          />
          <PrivacySection 
            title="2. Information We Collect" 
            content={`We may collect information about you in a variety of ways. The information we may collect on the Site includes:

• Personal Data: Personally identifiable information, such as your name and email address, that you voluntarily give to us when you choose to use our contact form. You are under no obligation to provide us with personal information of any kind, however your refusal to do so may prevent you from using certain features of the Site.

• Derivative Data: Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site.

• Financial Data: We do not collect or store any financial information. All payments (if applicable in the future) will be processed through third-party payment processors.

• Mobile Device Data: Device information, such as your mobile device ID, model, and manufacturer, and information about the location of your device if you access the Site from a mobile device.`} 
          />
          <PrivacySection 
            title="3. Use of Your Information" 
            content={`Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:

• Create and manage your account (if applicable).
• Email you regarding your account or order.
• Enable user-to-user communications.
• Generate a personal profile about you to make future visits to the Site more personalized.
• Increase the efficiency and operation of the Site.
• Monitor and analyze usage and trends to improve your experience with the Site.
• Notify you of updates to the Site.
• Offer new products, services, and/or recommendations to you.
• Perform other business activities as needed.
• Request feedback and contact you about your use of the Site.
• Resolve disputes and troubleshoot problems.
• Assist with any investigations.
• Respond to product and customer service requests.
• Send you a newsletter.
• Solicit support for the Site.`} 
          />
          <PrivacySection 
            title="4. Disclosure of Your Information" 
            content={`We may share information we have collected about you in certain situations. Your information may be disclosed as follows:

• By Law or to Protect Rights: If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.

• Third-Party Service Providers: We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.

• Marketing Communications: With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes, as permitted by law.

• Interactions with Other Users: If you interact with other users of the Site, those users may see your name, profile photo, and descriptions of your activity.

• Online Postings: When you post comments, contributions or other content to the Site, your posts may be viewed by all users and may be publicly distributed outside the Site in perpetuity.

• Third-Party Advertisers: We may use third-party advertising companies to serve ads when you visit the Site. These companies may use information about your visits to the Site and other websites that are contained in web cookies in order to provide advertisements about goods and services of interest to you.

• Affiliates: We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include our parent company and any subsidiaries, joint venture partners or other companies that we control or that are under common control with us.

• Business Partners: We may share your information with our business partners to offer you certain products, services or promotions.

• Other Third Parties: We may share your information with advertisers and investors for the purpose of conducting general business analysis. We may also share your information with such third parties for marketing purposes, as permitted by law.

• Sale or Bankruptcy: If we reorganize or sell all or a portion of our assets, undergo a merger, or are acquired by another entity, we may transfer your information to the successor entity. If we go out of business or enter bankruptcy, your information would be an asset transferred or acquired by a third party. You acknowledge that such transfers may occur and that the transferee may decline honor commitments we made in this Privacy Policy.`} 
          />
          <PrivacySection 
            title="5. Tracking Technologies" 
            content={`Cookies and Web Beacons
We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. When you access the Site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Site.

You may not decline web beacons. However, they may be rendered ineffective by declining all cookies or by modifying your web browser's settings to notify you each time a cookie is tendered, permitting you to accept or decline cookies on an individual basis.

Internet-Based Advertising
Additionally, we may use third-party software to serve ads on the Site, implement email marketing campaigns, and manage other interactive marketing initiatives. This third-party software may use cookies or similar tracking technology to help manage and optimize your online experience with us.`} 
          />
          <PrivacySection 
            title="6. Google AdSense" 
            content={`We use Google AdSense to display advertisements on our Site. Google, as a third-party vendor, uses cookies to serve ads on our Site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our Site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.

Google's advertising requirements can be summed up by Google's Advertising Principles. They are put in place to provide a positive experience for users.

We have implemented the following:
• Remarketing with Google AdSense
• Google Display Network Impression Reporting
• Demographics and Interests Reporting
• DoubleClick Platform Integration

We, along with third-party vendors such as Google use first-party cookies (such as the Google Analytics cookies) and third-party cookies (such as the DoubleClick cookie) or other third-party identifiers together to compile data regarding user interactions with ad impressions and other ad service functions as they relate to our website.`} 
          />
          <PrivacySection 
            title="7. Third-Party Websites" 
            content={`The Site may contain links to third-party websites and applications of interest, including advertisements and external services, that are not affiliated with us. Once you have used these links to leave the Site, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information. Before visiting and providing any information to any third-party websites, you should inform yourself of the privacy policies and practices (if any) of the third party responsible for that website, and should take those steps necessary to, in your discretion, protect the privacy of your information. We are not responsible for the content or privacy and security practices and policies of any third parties, including other sites, services or applications that may be linked to or from the Site.`} 
          />
          <PrivacySection 
            title="8. Security of Your Information" 
            content={`We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. Any information disclosed online is vulnerable to interception and misuse by unauthorized parties. Therefore, we cannot guarantee complete security if you provide personal information.`} 
          />
          <PrivacySection 
            title="9. Policy for Children" 
            content={`We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.`} 
          />
          <PrivacySection 
            title="10. Controls for Do-Not-Track Features" 
            content={`Most web browsers and some mobile operating systems include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. If you set the DNT signal on your browser, we will respond to such DNT browser signals.`} 
          />
          <PrivacySection 
            title="11. Options Regarding Your Information" 
            content={`You may at any time review or change the information in your account or terminate your account by:

• Logging into your account settings and updating your account
• Contacting us using the contact information provided below

Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, some information may be retained in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our Terms of Use and/or comply with legal requirements.

Emails and Communications
If you no longer wish to receive correspondence, emails, or other communications from us, you may opt-out by:

• Noting your preferences at the time you register your account with the Site
• Logging into your account settings and updating your preferences.
• Contacting us using the contact information provided below

If you no longer wish to receive correspondence, emails, or other communications from third parties, you are responsible for contacting the third party directly.`} 
          />
          <PrivacySection 
            title="12. Contact Us" 
            content={`If you have questions or comments about this Privacy Policy, please contact us at:

ProBeam Pro
Email: probeampro@gmail.com
Website: https://2dbeamcalculator.netlify.app

This Privacy Policy was created for ProBeam Pro — a free structural beam calculator built for civil engineering students and professionals worldwide.`} 
          />
        </div>

        <div style={{marginTop:32,textAlign:"center"}}>
          <button onClick={()=>setPage("home")} style={{background:"none",border:"1px solid #2a2d3a",color:"#9ca3af",fontFamily:"'Inter',sans-serif",fontSize:13,cursor:"pointer",padding:"10px 24px",borderRadius:8,transition:"border-color .2s,color .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#4f8ef7";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2d3a";e.currentTarget.style.color="#9ca3af";}}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function PrivacySection({ title, content }) {
  return (
    <div className="fade-up-d1" style={{background:"#0d0f1a",border:"1px solid #1e2130",borderRadius:12,padding:"20px 22px"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#e8eaf0",marginBottom:10}}>{title}</div>
      <div style={{fontSize:13,color:"#9ca3af",lineHeight:1.7,whiteSpace:"pre-line"}}>{content}</div>
    </div>
  );
}