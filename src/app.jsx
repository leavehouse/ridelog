import xs from 'xstream'

export function App (sources) {
  const domSource = sources.DOM;

  const addRide$ = domSource.select('.add-ride').events('click')
    .map(() => {
      return {
        type: 'ride',
        timestamp: new Date().toLocaleString()
      }
    });

  const addPayment$ = domSource.select('.add-payment').events('click')
    .map(() => {
      const amount = window.prompt("Payment amount:");
      const parsed_amount = parseInt(amount, 10);
      if (isNaN(parsed_amount)) {
          window.alert("Submitted amount is not a valid integer.");
          return null;
      }
      return {
        type: 'payment',
        timestamp: new Date().toLocaleString(),
        amount: parsed_amount,
      }
    });

  const action$ = xs.merge(addRide$, addPayment$);

  const state$ = action$.fold((actions, a) => {
      if (a === null) {
          return actions;
      }
      if (a.type === 'ride') {
        actions.rides.push({timestamp: a.timestamp});
      } else if (a.type === 'payment') {
        actions.payments.push({timestamp: a.timestamp, amount: a.amount});
      }
      return actions;
    },
    { rides: [], payments: [] }
  );

  const vtree$ = state$.map(state => {
    const rides = state.rides.slice().reverse().map(r =>
      <li>{r.timestamp}</li>);
    const payments = state.payments.slice().reverse().map(p =>
      <li>{p.amount} - {p.timestamp}</li>);
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

  const sinks = {
    DOM: vtree$
  }
  return sinks
}
