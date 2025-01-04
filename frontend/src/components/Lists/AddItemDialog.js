import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import CustomItemForm from './CustomItemForm';

const AddItemDialog = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('custom');

  const handleSubmitSuccess = async (formData) => {
    try {
      await onSubmit(formData);
      setOpen(false);
    } catch (error) {
      console.error('Error submitting item:', error);
      // Let the form handle the error display
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="movie">Movie</TabsTrigger>
            <TabsTrigger value="game">Game</TabsTrigger>
            <TabsTrigger value="book">Book</TabsTrigger>
            <TabsTrigger value="comic">Comic</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="mt-4">
            <CustomItemForm onSubmit={handleSubmitSuccess} />
          </TabsContent>

          <TabsContent value="movie" className="mt-4">
            <div className="text-center py-8">
              Movie search and add functionality coming soon
            </div>
          </TabsContent>

          <TabsContent value="game" className="mt-4">
            <div className="text-center py-8">
              Game search and add functionality coming soon
            </div>
          </TabsContent>

          <TabsContent value="book" className="mt-4">
            <div className="text-center py-8">
              Book search and add functionality coming soon
            </div>
          </TabsContent>

          <TabsContent value="comic" className="mt-4">
            <div className="text-center py-8">
              Comic search and add functionality coming soon
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
