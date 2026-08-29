import Transaction from "../models/Transaction.js";

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.json({
      transactions,
    });
  } catch {
    res.status(500).json({
      message: "Nu am putut încărca tranzacțiile.",
    });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { type, category, comment, amount, date } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({
        message: "Completează câmpurile obligatorii.",
      });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      category,
      comment,
      amount: Number(amount),
      date,
    });

    res.status(201).json({
      transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Nu am putut salva tranzacția.",
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Tranzacția nu există.",
      });
    }

    const { type, category, comment, amount, date } = req.body;

    transaction.type = type;
    transaction.category = category;
    transaction.comment = comment;
    transaction.amount = Number(amount);
    transaction.date = date;

    await transaction.save();

    res.json({
      transaction,
    });
  } catch {
    res.status(500).json({
      message: "Nu am putut modifica tranzacția.",
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Tranzacția nu există.",
      });
    }

    res.json({
      message: "Tranzacția a fost ștearsă.",
    });
  } catch {
    res.status(500).json({
      message: "Nu am putut șterge tranzacția.",
    });
  }
};
