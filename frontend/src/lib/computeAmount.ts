export function computeAmount(reg: any): number {
  if (reg?.totalAmount && reg.totalAmount > 0) return reg.totalAmount
  const ev = reg.event
  if (!ev) return 0
  const ticket = ev.ticketTypes?.find((t: any) => t.name === reg.ticketType) || ev.ticketTypes?.[0]
  const price = ticket && ticket.price && ticket.price > 0 ? ticket.price : (ev.registrationFee || 0)
  return price * (reg.quantity || 1)
}

export default computeAmount
