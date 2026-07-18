export function mapContractEventToActivityDto(e: any) {
  let topicArray: string[] = [];
  try {
    topicArray = typeof e.topic === 'string' ? JSON.parse(e.topic) : e.topic;
  } catch {
    topicArray = [e.topic];
  }
  const primaryTopic = topicArray[0] || 'event';

  let kind: 'execution' | 'deposit' | 'payout' | 'return' | 'conversion' | 'system' = 'system';
  let title = `Event: ${primaryTopic}`;
  let subtitle = `Contract: ${e.contractId.substring(0, 8)}`;
  let amount: string | undefined = undefined;

  const payload = e.payload as any;

  if (primaryTopic === 'payout') {
    kind = 'payout';
    const amt = payload?.amount ?? payload?.val ?? payload;
    const formattedAmt = amt ? (Number(amt) / 1e7).toLocaleString() : '0';
    title = `Recipient received funds`;
    subtitle = `Payout processed`;
    amount = `$${formattedAmt}`;
  } else if (primaryTopic === 'esclock') {
    kind = 'deposit';
    const amt = payload?.amount ?? payload?.val ?? payload;
    const formattedAmt = amt ? (Number(amt) / 1e7).toLocaleString() : '0';
    title = `Funds locked in escrow`;
    subtitle = `Escrow active`;
    amount = `$${formattedAmt}`;
  } else if (primaryTopic === 'escrel') {
    kind = 'return';
    const amt = payload?.amount ?? payload?.val ?? payload;
    const formattedAmt = amt ? (Number(amt) / 1e7).toLocaleString() : '0';
    title = `Escrow funds released`;
    subtitle = `Escrow complete`;
    amount = `$${formattedAmt}`;
  } else if (primaryTopic === 'conversion' || primaryTopic === 'swap') {
    kind = 'conversion';
    title = `Converted token`;
    subtitle = `Stellar DEX conversion`;
  } else if (primaryTopic === 'execution' || primaryTopic === 'run') {
    kind = 'execution';
    title = `Agreement executed`;
    subtitle = `Workflow automated`;
  }

  return {
    id: e.id,
    kind,
    title,
    subtitle,
    amount,
    status: 'completed',
    time: e.observedAt instanceof Date ? e.observedAt.toISOString() : new Date(e.observedAt).toISOString(),
    agreementId: e.agreementId,
  };
}
