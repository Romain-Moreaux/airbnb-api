import React from "react";
import axios from "axios";
class MainSection extends React.Component {
  state = {
    rooms: []
  };
  render = () => {
    return (
      <section className="main--container main-wrapper">
        <button onClick={this.getRooms}>get rooms</button>
        <div />
      </section>
    );
  };

  listRoom = () => {};

  getRooms = () => {
    axios
      .get(
        "http://localhost:3100/rooms?priceMin=100&priceMax=900&city=paris&sort=price-asc&page=2"
      )
      .then(response => response.data)
      .then(data => {
        this.setState({ rooms: data });
        const listRooms = this.state.rooms.map((room, i) => {
          <ListRooms key={i}>{room.title} </ListRooms>;
        });
      })
      .catch(error => {
        console.log(error);
      });
  };
}

export default MainSection;
