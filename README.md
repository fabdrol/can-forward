# can-forward

Simple node.js program that receives CAN traffic and forwards it on to another CANbus (primarily used for J1939 and NMEA2000 traffic). This could also be done using `candump <interface>,<filter> | cansend <interface>`, but I preferred a more expressive configuration file. 


## Usage

The program expects a file `can-forward-config.json` to be present in the users' home directory (a sample file is given below). Once you have set up your config, run: `node index.js`. 


## Configuration 

```javascript
{
  "from": "can0", // Interface to listen to
  "to": "vcan0", // Interface to send to 
  "filter": "include", // Kind of filter. Valid values are false, "include", "exclude"
  "include": [129025, 129026, 129029, 129539, 129540, 126992], // PGNs to forward if filter is set to "include"
  "exclude": [] // PGNs to block if filter is set to "exclude"
}
```

## Improvements that should probably be done

- [ ] Change the SRC address portion upon forwarding (and make this something that can be set in config)
- [ ] Add tests, test for CAN bus failures specifically



