export async function findOne({
  model,
  filters = {},
  select = "",
  populate = false,
  populateField = "",
}) {
  let result;
  if (populate) {
    result = await model
      .findOne(filters)
      .select(select)
      .populate(populateField);
  } else {
    result = await model.findOne(filters).select(select);
  }
  return result;
}
export async function find({
  model,
  filters = {},
  select = "",
  populate = false,
  populateField = "",
}) {
  let result;
  if (populate) {
    result = await model
      .find(filters)
      .select(select)
      .populate(populateField);
  } else {
    result = await model.find(filters).select(select);
  }
  return result;
}
export async function findById({
  model,
  id,
  select = "",
  populate = false,
  populateField = "",
}) {
  let result;
  if (populate) {
    result = await model
      .findById(id)
      .select(select)
      .populate(populateField);
  } else {
    result = await model.findById(id).select(select);
  }
  return result;
}
export async function create({ model, insertData, options = {} }) {
  const [result] = await model.create([insertData], options);
  return result;
}
export async function updateOne({ model, filters, data, options }) {
  let result = await model.updateOne(filters, data, options);
  return result;
}
export async function deleteOne({ model, filters, options }) {
  let result = await model.deleteOne(filters, options);
  return result;
}
