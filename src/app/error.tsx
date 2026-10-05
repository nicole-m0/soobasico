"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container empty-state"><h1>Não foi possível carregar esta página</h1><p>Tente novamente em instantes. Se você estava finalizando um pedido, confira a confirmação antes de enviar de novo.</p><button className="button primary" onClick={reset}>Tentar novamente</button></div>; }
