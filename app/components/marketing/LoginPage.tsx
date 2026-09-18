import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "../../config/brand";

export function LoginPage() {
  return <main className="login">
    <section className="login-image" style={{ backgroundImage: `url(${brand.images.login})` }}><div className="login-copy"><p className="eyebrow">Listo para empezar · Ready to begin</p><h1 className="display">Learn the kitchen before entering the rush.</h1><p style={{ lineHeight: 1.7, opacity: .82 }}>A focused introduction gives every practical shift a better starting point.</p></div></section>
    <section className="login-panel"><div className="login-card"><Link className="wordmark" href="/">{brand.name}.</Link><h2 className="display">Welcome to {brand.restaurantName}</h2><p className="muted">Use the demonstration credentials below, or jump directly into either role.</p><div className="login-form"><div className="field"><label htmlFor="code">Restaurant code</label><input id="code" defaultValue={brand.restaurantCode} /></div><div className="field"><label htmlFor="login-email">Email</label><input id="login-email" type="email" placeholder="bhavik@example.com" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" defaultValue="demopassword" /></div><div className="login-actions"><Link className="btn btn-primary" href="/employee">Continue as Employee <ArrowRight size={17} /></Link><Link className="btn btn-dark" href="/manager">Continue as Manager <ArrowRight size={17} /></Link></div><p className="muted" style={{ fontSize: 13, textAlign: "center" }}>This is a demonstration. No account is required.</p></div></div></section>
  </main>;
}
