import Router from 'koa-router';
import flightStore from './store';
import { broadcast } from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {

  console.log("in get")
  const response = ctx.response;
  const userId = ctx.state.user._id;
  const list=await flightStore.find({ userId });
  console.log(list)
  response.body = list;
  response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const flight = await flightStore.findOne({ _id: ctx.params.id });
  const response = ctx.response;
  if (flight) {
    if (flight.userId === userId) {
      response.body = flight;
      response.status = 200; // ok
    } else {
      response.status = 403; // forbidden
    }
  } else {
    response.status = 404; // not found
  }
});

const createFlight = async (ctx, flight, response) => {
  try {
    if (flight._id !==undefined)
    {
      delete flight._id;
    }
    const userId = ctx.state.user._id;
    console.log("in create flight"+userId);
    flight.userId = userId;
    response.body = await flightStore.insert(flight);
    response.status = 201; // created
    broadcast(userId, { type: 'created', payload: flight });
  } catch (err) {
    console.log("eroare "+err);
    response.body = { message: err.message };
    response.status = 400; // bad request
  }
};

router.post('/', async ctx => await createFlight(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
  const flight = ctx.request.body;
  const id = ctx.params.id;
  const flightId = flight._id;
  const response = ctx.response;
  if (flightId && flightId !== id) {
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  if (!flightId) {
    await createFlight(ctx, flight, response);
  } else {
    const updatedCount = await flightStore.update({ _id: id }, flight);
    if (updatedCount === 1) {
      response.body = flight;
      response.status = 200; // ok
      const userId = ctx.state.user._id;
      broadcast(userId, { type: 'updated', payload: flight });
    } else {
      response.body = { message: 'Resource no longer exists' };
      response.status = 405; // method not allowed
    }
  }
});

router.del('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const flight = await flightStore.findOne({ _id: ctx.params.id });
  if (flight && userId !== flight.userId) {
    ctx.response.status = 403; // forbidden
  } else {
    console.log(ctx.params.id)
    await flightStore.remove({ _id: ctx.params.id });
    ctx.response.status = 204; // no content
  }
});
