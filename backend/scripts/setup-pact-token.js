const { Keypair, Asset, TransactionBuilder, Operation, Horizon } = require('@stellar/stellar-sdk');

async function main() {
  const server = new Horizon.Server('https://horizon-testnet.stellar.org');
  const networkPassphrase = 'Test SDF Network ; September 2015';

  console.log('Generating keypairs...');
  const issuer = Keypair.random();
  const distributor = Keypair.random();

  console.log('Issuer Address:', issuer.publicKey());
  console.log('Distributor Address:', distributor.publicKey());
  console.log('Distributor Secret:', distributor.secret());

  // Fund via Friendbot
  console.log('Funding issuer via Friendbot...');
  await fetch(`https://friendbot.stellar.org?addr=${issuer.publicKey()}`);
  console.log('Funding distributor via Friendbot...');
  await fetch(`https://friendbot.stellar.org?addr=${distributor.publicKey()}`);

  console.log('Accounts funded. Waiting 5 seconds for ledger...');
  await new Promise(r => setTimeout(r, 5000));

  // Change trust from distributor to issuer
  const distributorAccount = await server.loadAccount(distributor.publicKey());
  const asset = new Asset('PACT', issuer.publicKey());

  console.log('Creating trustline for PACT from distributor...');
  const tx1 = new TransactionBuilder(distributorAccount, {
    fee: '10000',
    networkPassphrase,
  })
    .addOperation(
      Operation.changeTrust({
        asset,
        limit: '1000000000',
      })
    )
    .setTimeout(30)
    .build();

  tx1.sign(distributor);
  await server.submitTransaction(tx1);
  console.log('Trustline created successfully.');

  // Mint PACT: pay from issuer to distributor
  const issuerAccount = await server.loadAccount(issuer.publicKey());
  console.log('Minting 10,000,000 PACT...');
  const tx2 = new TransactionBuilder(issuerAccount, {
    fee: '10000',
    networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: distributor.publicKey(),
        asset,
        amount: '10000000',
      })
    )
    .setTimeout(30)
    .build();

  tx2.sign(issuer);
  await server.submitTransaction(tx2);
  console.log('Minting successful. Distributor now holds 10,000,000 PACT.');
  
  console.log('\n--- CONFIGURATION FOR .env ---');
  console.log(`PACT_ASSET_CODE=PACT`);
  console.log(`PACT_ASSET_ISSUER=${issuer.publicKey()}`);
  console.log(`PACT_DISTRIBUTION_PUBLIC=${distributor.publicKey()}`);
  console.log(`PACT_DISTRIBUTION_SECRET=${distributor.secret()}`);
}

main().catch(err => {
  console.error('Setup failed:', err);
});
