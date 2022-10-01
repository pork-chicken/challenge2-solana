// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const getWalletBalance = async (wallet) => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Make a wallet (keypair) from privateKey and get its balance
        const walletBalance = await connection.getBalance(
            new PublicKey(wallet.publicKey)
        );
        const balance = parseInt(walletBalance) / LAMPORTS_PER_SOL;
        console.log(`[BALANCE] wallet: ${wallet.publicKey.toString()}, balance: ${balance}`);
        return balance;
    } catch (err) {
        console.log(err);
        return 0;
    }
};

const airDropSol = async (wallet, amount) => {
    try {
        console.log(`[AIRDROP], wallet: ${wallet.publicKey.toString()}, amount: ${amount}`);
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const fromAirDropSignature = await connection.requestAirdrop(
            new PublicKey(wallet.publicKey),
            amount * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(fromAirDropSignature);
        console.log("DONE");
    } catch (err) {
        console.log(err);
    }
};


const transferSol = async(from, to, amount) => {
    console.log(`[SEND] from: ${from.publicKey.toString()}, to: ${to.publicKey.toString()}, amount: ${amount}`);
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: amount * LAMPORTS_PER_SOL
        })
    );
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    const url = "https://solscan.io/tx/" + signature + "?cluster=devnet";
    console.log("DONE, check the solscan", url);
};

const mainFunction = async(from, to) => {
    await getWalletBalance(from);
    await getWalletBalance(to);
    await airDropSol(from, 2);
    const amount = await getWalletBalance(from);
    await transferSol(from, to, amount / 2);
    await getWalletBalance(from);
    await getWalletBalance(to);
};

const from = Keypair.generate();
const to = Keypair.generate();

mainFunction(from, to);

