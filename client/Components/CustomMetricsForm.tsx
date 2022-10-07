import * as React from 'react';
import { FC } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ErrorIcon from '@mui/icons-material/Error';

const CustomMetricsForm: FC<{setUpdateList: Function, updateList: number}> = props => {
  const {updateList, setUpdateList} = props;
  const [metricName, setMetricName] = React.useState('');
  const [promQuery, setPromQuery] = React.useState('');
  const [yAxisType, setYAxisType] = React.useState('');
  const [scope, setScope] = React.useState('');
  const [validity, setValidity] = React.useState(false);

  const handleMetricInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('metric name: ', event.target.value);
    setMetricName(event.target.value);
  };

  const handleQueryInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('your prom query: ', event.target.value);
    setPromQuery(event.target.value);
  };

  const handleYAxisSelect = (event: SelectChangeEvent) => {
    console.log('y axis unit: ', event.target.value);
    setYAxisType(event.target.value);
  };

  const handleScopeSelect = (event: SelectChangeEvent) => {
    console.log('scope: ', event.target.value);
    setScope(event.target.value);
  };

  // unclear on event type
  const handleSubmit = (event: any) => {
    fetch('/api/custom/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({scope, query: promQuery, yAxisType, name: metricName})
    })
      .then(res => res.json())
      .then(addedQuery => {
        if (addedQuery) {
          console.log('Query added successfully');
          setUpdateList(updateList + 1);
        }
        else console.log('Query was not added');
      })
  };

  React.useEffect(() => {
    // send query to backend (delay)
    fetch('/api/custom/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({scope: scope, query: promQuery})
    })
      .then(res => res.json())
      .then(data => setValidity(data === true ? true : false))
    // render check or x based on validity
  }, [promQuery, scope]);

  console.log('query validity: ', validity);

  return (
    <div>
      <h2
      style={{ margin: 25 }}
      >
      Custom Metrics Form
      </h2>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 3, width: '65ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            id="outlined-required"
            label="Metric Name"
            variant="outlined"
            defaultValue=""
            value={metricName}
            onChange={handleMetricInput}
          />
        </div>
      </Box>
      {validity === true || promQuery === '' ?
        <Stack
        direction="row"
        >
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 3, width: '65ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              id="outlined-required"
              label="PromQL Query"
              variant="outlined"
              defaultValue=""
              value={promQuery}
              onChange={handleQueryInput}
            />
          </div>
        </Box>
        {validity && <TaskAltIcon sx={{ mt: 5 }} />}
        </Stack>
        :
        <Stack
        direction="row"
        >
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 3, width: '65ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              id="outlined-error-helper-text"
              label="PromQL Query"
              variant="outlined"
              defaultValue=""
              value={promQuery}
              onChange={handleQueryInput}
              error
              helperText="Invalid"
            />
          </div>
        </Box>
        <ErrorIcon sx={{ mt: 5 }} />
        </Stack>
      }
      <Box sx={{ m: 3, width: '25ch' }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Unit Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={yAxisType}
            label="Unit Type"
            onChange={handleYAxisSelect}
          >
            <MenuItem value={'percent'}>Percent</MenuItem>
            <MenuItem value={'seconds'}>Seconds</MenuItem>
            <MenuItem value={'gigabytes'}>Gigabytes</MenuItem>
            <MenuItem value={'kilobytes'}>Kilobytes</MenuItem>
            <MenuItem value={'null'}>None</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ m: 3, width: '25ch' }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Scope</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={scope}
            label="Unit Type"
            onChange={handleScopeSelect}
          >
            <MenuItem value={'cluster'}>Cluster</MenuItem>
            <MenuItem value={'node'}>Nodes</MenuItem>
            <MenuItem value={'pod'}>Pods</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Button
        variant="contained"
        endIcon={<SendIcon />}
        disabled={metricName === '' || promQuery === '' || scope === '' || validity === false}
        onClick={() => handleSubmit(event)}
        sx={{ m: 3, width: '25ch' }}
        >
        Submit Query
      </Button>
    </div>
  )
}

// form
// metric name: text field
// prom query: text field
// y axis type: select (percent, GB, KB)
// scope: select (cluster, node, pod)
// submit: button (all fields required to enable)

// fill out form
// submit enabled
// on submit, send this query to the backend
  // clear out forms if valid, success snackbar
    // send full state info to backend
  // leave filled out forms if invalid, error snackbar, highlight query input field red

export default CustomMetricsForm;