import unittest
import re

from src.hospital_data.hospital_api import get_hospital_state, get_patient_data, get_queue_data

class TestAPIResponses(unittest.TestCase):

    def test_get_hospital_state(self):
        data = get_hospital_state()
                
        wait_time_pattern = re.compile(r'^\d+$')
        category_pattern = re.compile(r'^[1-5]$')
        
        self.assertIn('averageWaitTimes', data)
        self.assertIn('categoryBreakdown', data)

        for key, value in data['averageWaitTimes'].items():
            self.assertTrue(category_pattern.match(key))
            self.assertTrue(wait_time_pattern.match(str(value)))

        for key, value in data['categoryBreakdown'].items():
            self.assertTrue(category_pattern.match(key))
            self.assertTrue(wait_time_pattern.match(str(value)))

    def test_get_patient_data(self):
        patient_id = "any_id"
        data = get_patient_data(patient_id)

        print(data)
        
        time_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+$')
        category_pattern = re.compile(r'^[1-5]$')
        id_pattern = re.compile(r'^\d+$')
        phase_pattern = re.compile(r'^\w+$')

        self.assertIn('arrival_time', data)
        self.assertTrue(time_pattern.match(data['arrival_time']))

        self.assertIn('id', data)
        self.assertTrue(id_pattern.match(str(data['id'])))

        self.assertIn('queue_position', data)
        self.assertIn('category', data['queue_position'])
        self.assertIn('global', data['queue_position'])

        self.assertTrue(category_pattern.match(str(data['queue_position']['category'])))
        self.assertTrue(id_pattern.match(str(data['queue_position']['global'])))

        self.assertIn('status', data)
        self.assertIn('current_phase', data['status'])
        self.assertTrue(phase_pattern.match(data['status']['current_phase']))

        self.assertIn('investigations', data['status'])
        self.assertIn('imaging', data['status']['investigations'])
        self.assertIn('labs', data['status']['investigations'])

    """
    def test_get_queue_data(self):
        data = get_queue_data()
                
        wait_time_pattern = re.compile(r'^\d+$')
        category_pattern = re.compile(r'^[1-5]$')

        self.assertIn('averageWaitTimes', data)
        self.assertIn('categoryBreakdown', data)

        for key, value in data['averageWaitTimes'].items():
            self.assertTrue(category_pattern.match(key))
            self.assertTrue(wait_time_pattern.match(str(value)))

        for key, value in data['categoryBreakdown'].items():
            self.assertTrue(category_pattern.match(key))
            self.assertTrue(wait_time_pattern.match(str(value)))
    """

if __name__ == '__main__':
    unittest.main()
