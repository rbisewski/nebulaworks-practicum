import fetch from 'node-fetch';

const datasetURL: string = "https://san-francisco.datasettes.com/sf-trees/Street_Tree_List.json?_labels=on&_next=";
const howardStreetURL: string = "https://san-francisco.datasettes.com/sf-trees/Street_Tree_List.json?qAddress__exact=747+Howard+St&_sort_desc=qAddress&_labels=on";

async function main() {

  // GPS coords from Google Maps, roughly five blocks from the Moscone Center
  const fiveBlocksLatitude: number = 37.7746156090338;
  const fiveBlocksLongitude: number = -122.41269931600299;

  // calculate the distance between Moscone Center and the coords above
  const howardStreet: any = await getHowardStreet();
  const radiusOfFiveBlocks = radius(howardStreet.Latitude, fiveBlocksLatitude, howardStreet.Longitude, fiveBlocksLongitude);

  // Grabs the "filtered_table_rows_count" value that represents the total number of rows
  let count: number = await rowsCount();

  let trees: Array<any> = [];

  print("Searching thru all trees in the SF dataset...");
  for (let i: number = 0; i < count; i += 100) {
    let response: any = await fetch(datasetURL + i);
    let json: any = await response.json();
    json.rows.forEach((row: any) => {
      if (row.Latitude != null && row.Longitude != null) {
        let distance = radius(row.Latitude, fiveBlocksLatitude, row.Longitude, fiveBlocksLongitude);
        if (distance < radiusOfFiveBlocks) {
          trees.push(row);
        }
      }
    });
  }
  print("Total number of trees in the 5 block radius of Moscone Center: " + trees.length);
}

async function rowsCount() {
  const response: any = await fetch(datasetURL + "0");
  const json: any = await response.json();
  return json.filtered_table_rows_count as number;
}

async function getHowardStreet() {
  const response: any = await fetch(howardStreetURL);
  const json: any = await response.json();
  return {
    XCoord: json.rows[0].XCoord as number,
    YCoord: json.rows[0].YCoord as number,
    Latitude: json.rows[0].Latitude as number,
    Longitude: json.rows[0].Longitude as number,
  };
}

function radius(lat1: number, lat2: number, long1: number, long2: number) {
  return Math.sqrt(Math.pow(lat1-lat2, 2) + Math.pow(long1-long2, 2));
}

// TODO: use a real logging library here
function print(message: string) {
  console.log(message);
}

//---------------------------------------------------------
main();