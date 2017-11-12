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
      const parsed_amount = parseInt(amount, 10);
      if (isNaN(parsed_amount)) {
          window.alert("Submitted amount is not a valid integer.");
          return null;
      }
      return {
        type: 'addPayment',
        timestamp: getTimestamp(),
        amount: parsed_amount,
      }
    });

  return xs.merge(addRide$, addPayment$);
}

function model(action$) {
  return action$.fold((actions, a) => {
      if (a === null) {
          return actions;
      }
      if (a.type === 'addRide') {
        actions.rides.push({timestamp: a.timestamp});
      } else if (a.type === 'addPayment') {
        actions.payments.push({timestamp: a.timestamp, amount: a.amount});
      }
      return actions;
    },
    { rides: [], payments: [] }
  );
}

function view(state$) {
  return state$.map(state => {
    const rides = state.rides.slice().reverse().map(r =>
      <li>
        <label>{r.timestamp}</label>
        <button className="delete-ride">×</button>
      </li>);

    const payments = state.payments.slice().reverse().map(p =>
      <li>
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
