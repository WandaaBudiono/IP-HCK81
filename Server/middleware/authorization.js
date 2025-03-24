// const { User, Gift, Voucher } = require("../models");

// async function authorization(req, res, next) {
//   try {
//     const { id } = req.user;
//     const gift = await Gift.findOne({
//       where: { ReceiverId: id },
//     });

//     if (!gift) {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// async function isGiftOwner(req, res, next) {
//   try {
//     const { id } = req.user;
//     const { id: GiftId } = req.params;

//     const gift = await Gift.findOne({
//       where: { id: GiftId },
//     });

//     if (!gift) {
//       return res.status(404).json({ message: "Gift not found" });
//     }

//     if (gift.ReceiverId !== id) {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }

//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// module.exports = { authorization, isGiftOwner };
