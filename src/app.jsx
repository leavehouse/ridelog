import xs from 'xstream'

export function App (sources) {
  const actions = intent(sources.DOM);
  const state$ = model(actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$
  }
}

function getTimestamp() {
    return new Date().toLocaleString()
}

function intent(domSource) {
  const addRide$ = domSource.select('.add-ride').events('click')
    .map(() => ({type: 'addRide', timestamp: getTimestamp()}));

  const addPayment$ = domSource.select('.add-payment').events('click')
    .map(() => {
      const amount = window.prompt("Payment amount:");
      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount)) {
          window.alert("Submitted amount is not a valid integer.");
          return null;
      }
      return {
        type: 'addPayment',
        timestamp: getTimestamp(),
        amount: parsedAmount,
      }
    });

  const deleteRide$ = domSource.select('.delete-ride').events('click')
    .map(ev => {
      const confirmDelete = window.confirm("Please confirm that you want to delete this ride.");
      if (confirmDelete) {
        return {
          type: 'deleteRide',
          index: ev.target.parentElement.dataset.index,
        }
      } else {
        return null;
      }
    });

  const deletePayment$ = domSource.select('.delete-payment').events('click')
    .map(ev => {
      const confirmDelete = window.confirm("Please confirm that you want to delete this payment.");
      if (confirmDelete) {
        return {
          type: 'deletePayment',
          index: ev.target.parentElement.dataset.index,
        }
      } else {
        return null;
      }
    });

  return xs.merge(addRide$, addPayment$, deleteRide$, deletePayment$);
}

// TODO: use reducers?
function model(action$) {
  return action$.fold((state, a) => {
      if (a === null) {
          return state;
      }
      if (a.type === 'addRide') {
        state.rides.push({timestamp: a.timestamp});
      } else if (a.type === 'addPayment') {
        state.payments.push({timestamp: a.timestamp, amount: a.amount});
      } else if (a.type === 'deleteRide') {
        state.rides.splice(a.index, 1);
      } else if (a.type === 'deletePayment') {
        state.payments.splice(a.index, 1);
      }
      return state;
    },
    { rides: [], payments: [] }
  );
}

function view(state$) {
  return state$.map(state => {
    const ridesList = state.rides.slice().map((r, i) => [r, i]);
    const rides = ridesList.reverse().map(([r, i]) =>
      <li data-index={i.toString()}>
        <label>{r.timestamp}</label>
        <button className="delete-ride">×</button>
      </li>
    );

    const paymentsList = state.payments.slice().map((p, i) => [p, i]);
    const payments = paymentsList.reverse().map(([p, i]) =>
      <li data-index={i.toString()}>
        <label>${p.amount} on {p.timestamp}</label>
        <button className="delete-payment">×</button>
      </li>);

    return (
      <div>
        <div className="controls">
          <button className="add-ride">Add Ride</button>
          <button className="add-payment">Add Payment</button>
        </div>
        <ul>{rides}</ul>
        <ul>{payments}</ul>
      </div>
    );
  });
}
